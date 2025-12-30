const SIZE = 5;

const STATES = {
    UNKNOWN: "unknown",
    BLUE: "blue",
    TEAL: "teal",
    GREEN: "green",
    YELLOW: "yellow",
    ORANGE: "orange"
}

let board = Array.from({length: SIZE}, () =>
    Array.from({length: SIZE}, () => STATES.UNKNOWN)
)