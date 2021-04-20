import { remove } from "lodash";
import {generatePairing, generatePairings} from "../src/pairing";


describe('Pairing', () => {
    test('create match - 10 players', () => {
        const count = 10;

        const pairings = generatePairings(count);
        // console.log(pairings);

        for (let round = 1; round < count; round++) {
            const pairing = generatePairing(pairings, count);
            // console.log(pairing);

            expect(pairing.length).toEqual(count);

            pairing.forEach(p => remove(pairings, x => x == p));
        }

        expect(pairings.length).toEqual(0);
    });

    test('1 player', () => {
        const pairings = generatePairings(1);
        console.log(pairings);
        expect(pairings).toEqual([]);
    });

    test('2 players', () => {
        const pairings = generatePairings(2);
        console.log(pairings);
        expect(pairings).toEqual([
            [0, 1],
            [1, 0],
        ]);
    });

    test('3 players', () => {
        const pairings = generatePairings(3);
        console.log(pairings);
        expect(pairings).toEqual([
            [0, 1],
            [0, 2],
            [1, 0],
            [1, 2],
            [2, 0],
            [2, 1],
        ]);
    });
});
