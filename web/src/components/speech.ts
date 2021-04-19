
let voices = [];

function populateVoiceList() {
    const synth = window.speechSynthesis;
    voices = synth.getVoices().sort(function (a, b) {
        const aname = a.name.toUpperCase(), bname = b.name.toUpperCase();
        if ( aname < bname ) return -1;
        else if ( aname == bname ) return 0;
        else return +1;
    });
}

if (typeof window !== "undefined") {
    populateVoiceList();

    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoiceList;
    }
}

export function speak(text: string) {
    const synth = window.speechSynthesis;
    if (synth.speaking) {
        console.error('speechSynthesis.speaking');
        return;
    }
    if (text !== '') {
        const utterThis = new SpeechSynthesisUtterance(text);
        utterThis.onend = function (event) {
            console.log('SpeechSynthesisUtterance.onend');
        }
        utterThis.onerror = function (event) {
            console.error('SpeechSynthesisUtterance.onerror');
        }
        utterThis.voice = voices.find(v => v.lang === 'en-US');
        utterThis.pitch = 1;
        utterThis.rate = 1;
        synth.speak(utterThis);
    }
}
