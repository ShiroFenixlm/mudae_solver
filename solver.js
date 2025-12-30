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
);

function render() {
    const boardDiv = document.getElementById("board");
    boardDiv.innerHTML = "";

    for (let y = 1; y <= SIZE; y++){
        for (let x = 1; x <= SIZE; x++){
            const cell = document.createElement("div");
            cell.className = "cell";

            if (board[x][y] !== STATES.UNKNOWN){
                cell.classList.add(board[x][y])
            }
        }
        
    }
}