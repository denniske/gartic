// =======================================================================================
// The ChatRoom Durable Object Class

// ChatRoom implements a Durable Object that coordinates an individual chat room. Participants
// connect to the room using WebSockets, and the room broadcasts messages from each participant
// to all others.
import {getUniqueID, handleErrors} from "./util";
import {RateLimiterClient} from './rate-limiter-client';
import {WebSocketLike} from "./types";
import GameServer from "./server/game-server";
import LobbyServer from "./server/lobby-server";

export interface ISession {
    id: string;
    quit?: boolean;
    webSocket: WebSocketLike;
    idleTimeout?: NodeJS.Timeout;
}

export interface IChatRoom {
    send(sessionId: string, message: any): void;
    broadcast(message: any): void;
    close(sessionId: string, code: number, reason: string): void;
}

const closeReasonIdle = 'REASON_IDLE';

export class ChatRoom implements DurableObject, IChatRoom {
    storage: DurableObjectStorage;
    env: any;
    sessions: ISession[];
    lastMessageReceived?: Date;

    gameServer: GameServer;
    lobbyServer: LobbyServer;

    constructor(controller: DurableObjectState, env: any) {
        // `controller.storage` provides access to our durable storage. It provides a simple KV
        // get()/put() interface.
        this.storage = controller.storage;

        // `env` is our environment bindings (discussed earlier).
        this.env = env;

        this.sessions = [];

        this.lobbyServer = new LobbyServer(this);
        this.gameServer = new GameServer(this, this.lobbyServer);
    }

    // The system will call fetch() whenever an HTTP request is sent to this Object. Such requests
    // can only be sent from other Worker code, such as the code above; these requests don't come
    // directly from the internet. In the future, we will support other formats than HTTP for these
    // communications, but we started with HTTP for its familiarity.
    async fetch(request: Request) {
        return await handleErrors(request, async () => {
            let url = new URL(request.url);

            switch (url.pathname) {
                case "/websocket": {
                    // The request is to `/api/room/<name>/websocket`. A client is trying to establish a new
                    // WebSocket session.
                    if (request.headers.get("Upgrade") != "websocket") {
                        return new Response("expected websocket", {status: 400});
                    }

                    // Get the client's IP address for use with the rate limiter.
                    let ip = request.headers.get("CF-Connecting-IP");

                    // To accept the WebSocket request, we create a WebSocketPair (which is like a socketpair,
                    // i.e. two WebSockets that talk to each other), we return one end of the pair in the
                    // response, and we operate on the other end. Note that this API is not part of the
                    // Fetch API standard; unfortunately, the Fetch API / Service Workers specs do not define
                    // any way to act as a WebSocket server today.
                    let pair = new WebSocketPair();

                    // We're going to take pair[1] as our end, and return pair[0] to the client.
                    await this.handleSession(pair[1], ip);

                    // Now we return the other end of the pair to the client.
                    return new Response(null, {status: 101, webSocket: pair[0]});
                }

                default:
                    return new Response("Not found", {status: 404});
            }
        });
    }

    exit() {
        // 10 minutes
        if ((new Date().getTime() - this.lastMessageReceived!.getTime()) / 1000 > 10 * 60 * 1000) {
            this.sessions.forEach(session => session.webSocket.close(1000, closeReasonIdle));
        }
    }

    // handleSession() implements our WebSocket-based chat protocol.
    async handleSession(webSocket: WebSocketLike, ip: any) {
        // Accept our end of the WebSocket. This tells the runtime that we'll be terminating the
        // WebSocket in JavaScript, not sending it elsewhere.
        webSocket.accept();

        // Set up our rate limiter client.
        let limiterId: any = null;
        let limiter: RateLimiterClient | null = null;
        if (this.env.limiters) {
            limiterId = this.env.limiters.idFromName(ip);
            limiter = new RateLimiterClient(
                () => this.env.limiters.get(limiterId),
                (err: any) => webSocket.close(1011, err.stack));
        }

        // Create our session and add it to the sessions list.
        // We don't send any messages to the client until it has sent us the initial user info
        // message. Until then, we will queue messages in `session.blockedMessages`.
        let session = {id: getUniqueID(), webSocket} as ISession;
        this.sessions.push(session);

        this.lobbyServer.open(session.id)

        // Queue "join" messages for all online users, to populate the client's roster.
        // this.sessions.forEach(otherSession => {
        //   if (otherSession.name) {
        //     session.blockedMessages?.push(JSON.stringify({joined: { id: otherSession.id, name: otherSession.name}}));
        //   }
        // });

        // Load the last 100 messages from the chat history stored on disk, and send them to the
        // client.
        // let storage = await this.storage.list({reverse: true, limit: 100, prefix: 'message:'});
        // let backlog = [...storage.values()];
        // backlog.reverse();
        // backlog.forEach(value => {
        //   session.blockedMessages?.push(value as string);
        // });

        this.lobbyServer.open(session.id);

        setInterval(() => this.exit(), 1000);

        webSocket.addEventListener("message", async msg => {
            try {
                if (session.quit) {
                    // Whoops, when trying to send to this WebSocket in the past, it threw an exception and
                    // we marked it broken. But somehow we got another message? I guess try sending a
                    // close(), which might throw, in which case we'll try to send an error, which will also
                    // throw, and whatever, at least we won't accept the message. (This probably can't
                    // actually happen. This is defensive coding.)
                    webSocket.close(1011, "WebSocket broken.");
                    return;
                }

                // Check if the user is over their rate limit and reject the message if so.
                if (limiter && !limiter.checkLimit()) {
                    webSocket.send(JSON.stringify({
                        error: "Your IP is being rate-limited, please try again later."
                    }));
                    return;
                }

                this.lastMessageReceived = new Date();

                console.log();
                console.log('parse', msg);

                let data = JSON.parse(msg.data);

                this.lobbyServer.message(session.id, data);
                this.gameServer.message(session.id, data);

                // if (data.message) {
                //   // Construct sanitized message for storage and broadcast.
                //   data = { name: session.name, message: "" + data.message + ' (v4)' };
                //
                //   // Block people from sending overly long messages. This is also enforced on the client,
                //   // so to trigger this the user must be bypassing the client code.
                //   if (data.message.length > 256) {
                //     webSocket.send(JSON.stringify({error: "Message too long."}));
                //     return;
                //   }
                //
                //   // Add timestamp. Here's where this.lastTimestamp comes in -- if we receive a bunch of
                //   // messages at the same time (or if the clock somehow goes backwards????), we'll assign
                //   // them sequential timestamps, so at least the ordering is maintained.
                //   data.timestamp = Math.max(Date.now(), this.lastTimestamp + 1);
                //   this.lastTimestamp = data.timestamp;
                //
                //   // Broadcast the message to all other WebSockets.
                //   let dataStr = JSON.stringify(data);
                //   this.broadcast(dataStr);
                //
                //   // Save message.
                //   let key = 'message:' + new Date(data.timestamp).toISOString();
                //   await this.storage.put(key, dataStr);
                // }
            } catch (err) {
                // Report any exceptions directly back to the client. As with our handleErrors() this
                // probably isn't what you'd want to do in production, but it's convenient when testing.
                console.error(session.id, err);
                webSocket.send(JSON.stringify({error: err.stack}));
            }
        });

        // On "close" and "error" events, remove the WebSocket from the sessions list and broadcast
        // a quit message.
        let closeOrErrorHandler = (evt: any) => {
            session.quit = true;
            this.sessions = this.sessions.filter(member => member !== session);
            this.lobbyServer.close(session.id);
            this.gameServer.close(session.id);
        };
        webSocket.addEventListener("close", closeOrErrorHandler);
        webSocket.addEventListener("error", closeOrErrorHandler);
    }

    send(sessionId: string, message: any) {
        const session = this.sessions.find(s => s.id == sessionId);
        if (session == null) {
            console.error(`Could not find session ${sessionId}`);
            return;
        }

        if (typeof message !== "string") {
            message = JSON.stringify(message);
        }

        console.log('send', sessionId, message);

        session.webSocket.send(message);
    }

    broadcast(message: any) {
        if (typeof message !== "string") {
            message = JSON.stringify(message);
        }

        console.log('broadcast', message);

        // Iterate over all the sessions sending them messages.
        let quitters: ISession[] = [];
        this.sessions = this.sessions.filter(session => {
            // if (session.name) {
            try {
                session.webSocket.send(message);
                return true;
            } catch (err) {
                // Whoops, this connection is dead. Remove it from the list and arrange to notify
                // everyone below.
                session.quit = true;
                quitters.push(session);
                return false;
            }
            // } else {
            // This session hasn't sent the initial user info message yet, so we're not sending them
            // messages yet (no secret lurking!). Queue the message to be sent later.
            // session.blockedMessages?.push(message);
            // return true;
            // }
        });

        quitters.forEach(quitter => {
            this.lobbyServer.close(quitter.id);
        });
    }

    close(sessionId: string, code: number, reason: string) {
        const session = this.sessions.find(s => s.id == sessionId);
        if (session == null) {
            console.error(`Could not find session ${sessionId}`);
            return;
        }

        session.webSocket.close(code, reason);
    }
}
