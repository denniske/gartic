import { shuffle } from "lodash";

export type Pairing = [number, number];

export function generatePairings(count: number) {
    const pairings: Pairing[] = [];
    for (let i = 0; i < count; i++) {
        for (let j = 0; j < count; j++) {
            if (i != j) {
                pairings.push([i, j]);
            }
        }
    }
    return pairings;
}

export function generatePairing(availablePairings: Pairing[], count: number): Pairing[] {
    // console.log('availablePairings', availablePairings, 'count', count);

    availablePairings = shuffle(availablePairings);

    for (let i = 0; i < availablePairings.length; i++) {
        const chosenPairing = availablePairings[i];
        const generatedPairing = generatePairing(
            availablePairings.filter(p => p[0] != chosenPairing[0] && p[1] != chosenPairing[1]),
            count - 1,
        );

        // console.log('generatedPairing', generatedPairing.length, 'needed', count-1);

        if (generatedPairing.length === count-1) {
            return [chosenPairing, ...generatedPairing];
        }
    }

    return [];
}
