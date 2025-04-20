// Sample Structures
const sampleStructures = {
    short: {
        name: "Short Tournament",
        rounds: [
            { duration: 15, smallBlind: 25, bigBlind: 50, ante: 0, isBreak: false },
            { duration: 15, smallBlind: 50, bigBlind: 100, ante: 0, isBreak: false },
            { duration: 15, smallBlind: 100, bigBlind: 200, ante: 25, isBreak: false },
            { duration: 10, smallBlind: 0, bigBlind: 0, ante: 0, isBreak: true },
            { duration: 15, smallBlind: 150, bigBlind: 300, ante: 25, isBreak: false },
            { duration: 15, smallBlind: 200, bigBlind: 400, ante: 50, isBreak: false }
        ]
    },
    medium: {
        name: "Medium Tournament",
        rounds: [
            { duration: 20, smallBlind: 25, bigBlind: 50, ante: 0, isBreak: false },
            { duration: 20, smallBlind: 50, bigBlind: 100, ante: 0, isBreak: false },
            { duration: 20, smallBlind: 75, bigBlind: 150, ante: 25, isBreak: false },
            { duration: 10, smallBlind: 0, bigBlind: 0, ante: 0, isBreak: true },
            { duration: 20, smallBlind: 100, bigBlind: 200, ante: 25, isBreak: false },
            { duration: 20, smallBlind: 150, bigBlind: 300, ante: 25, isBreak: false },
            { duration: 20, smallBlind: 200, bigBlind: 400, ante: 50, isBreak: false },
            { duration: 10, smallBlind: 0, bigBlind: 0, ante: 0, isBreak: true },
            { duration: 20, smallBlind: 300, bigBlind: 600, ante: 50, isBreak: false }
        ]
    },
    long: {
        name: "Long Tournament",
        rounds: [
            { duration: 30, smallBlind: 25, bigBlind: 50, ante: 0, isBreak: false },
            { duration: 30, smallBlind: 50, bigBlind: 100, ante: 0, isBreak: false },
            { duration: 30, smallBlind: 75, bigBlind: 150, ante: 0, isBreak: false },
            { duration: 10, smallBlind: 0, bigBlind: 0, ante: 0, isBreak: true },
            { duration: 30, smallBlind: 100, bigBlind: 200, ante: 25, isBreak: false },
            { duration: 30, smallBlind: 150, bigBlind: 300, ante: 25, isBreak: false },
            { duration: 30, smallBlind: 200, bigBlind: 400, ante: 25, isBreak: false },
            { duration: 10, smallBlind: 0, bigBlind: 0, ante: 0, isBreak: true },
            { duration: 30, smallBlind: 300, bigBlind: 600, ante: 50, isBreak: false },
            { duration: 30, smallBlind: 400, bigBlind: 800, ante: 50, isBreak: false },
            { duration: 30, smallBlind: 500, bigBlind: 1000, ante: 100, isBreak: false },
            { duration: 10, smallBlind: 0, bigBlind: 0, ante: 0, isBreak: true },
            { duration: 30, smallBlind: 600, bigBlind: 1200, ante: 100, isBreak: false }
        ]
    }
};