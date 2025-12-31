

const STATES = {
    UNKNOWN: "unknown",
    BLUE: "blue",
    TEAL: "teal",
    GREEN: "green",
    YELLOW: "yellow",
    ORANGE: "orange"
}

const gameState = {
    size: 5,
    board: createBoard(5),
    possibleRed: [],
    suggestions: []
}

function getStateBoard(board) {
  return board.map(row =>
    row.map(cell => cell.state)
  );
}

function createBoard(size) {
    return Array.from({length: size}, () =>
    Array.from({length: size}, () => ({state: STATES.UNKNOWN}))
);
}



let selectedCell = null;

function onCellClick(x, y) {
  selectedCell = { x, y };
}

document.querySelectorAll("#palette button").forEach(btn => {
    btn.addEventListener("click", () => {
        if (!selectedCell) return;

        const {x, y} = selectedCell;
        gameState.board[y][x].state = btn.dataset.color;

        selectedCell = null
        updateGame()
    })
})

function updateGame() {
  const stateBoard = getStateBoard(gameState.board);

  // Clear previous highlights
  for (let row of gameState.board) {
    for (let cell of row) {
      delete cell.highlight;
    }
  }

  gameState.possibleReds = getPossibleReds(stateBoard);
  gameState.suggestions = suggestMoves(stateBoard);

  // Highlight red candidates
  if (gameState.possibleReds.length === 1) {
    const red = gameState.possibleReds[0];
    gameState.board[red.y][red.x].highlight = "red-100";
  } else if (gameState.possibleReds.length === 2) {
    for (const red of gameState.possibleReds) {
      gameState.board[red.y][red.x].highlight = "red-50";
    }
  }

  renderBoard();
}

function renderBoard() {
  const boardDiv = document.getElementById("board");
  boardDiv.innerHTML = "";

  for (let y = 0; y < gameState.size; y++) {
    for (let x = 0; x < gameState.size; x++) {
      const cellDiv = document.createElement("div");
      cellDiv.className = "cell";

      const cell = gameState.board[y][x];

      // Color state
      if (cell.state !== STATES.UNKNOWN) {
        cellDiv.classList.add(cell.state);
      }

      // Highlight for red candidates
      if (cell.highlight === "red-100") {
        cellDiv.classList.add("highlight-red");
      } else if (cell.highlight === "red-50") {
        cellDiv.classList.add("highlight-red-dashed");
      }

      // Highlight suggestions
      const suggestion = gameState.suggestions.find(
        s => s.x === x && s.y === y
      );

      if (suggestion) {
        cellDiv.classList.add(
          suggestion.score === gameState.suggestions[0].score
            ? "best"
            : "good"
        );
      }

      cellDiv.onclick = () => onCellClick(x, y);
      boardDiv.appendChild(cellDiv);
    }
  }
}

function validRelativePosition(color, x, y, rx, ry) {
  const dx = x - rx;
  const dy = y - ry;

  switch (color) {
    case "orange":
      return Math.abs(dx) + Math.abs(dy) === 1;

    case "yellow":
      return Math.abs(dx) === 1 && Math.abs(dy) === 1;

    case "green":
      return x === rx || y === ry;

    case "teal":
      return (
        x === rx ||
        y === ry ||
        Math.abs(dx) === Math.abs(dy)
      );

    case "blue":
      return !(
        x === rx ||
        y === ry ||
        Math.abs(dx) === Math.abs(dy)
      );

    default:
      return true; // unknown
  }
}


function getPossibleReds(stateBoard) {
  const size = stateBoard.length;
  const center = Math.floor(size / 2);
  const possible = [];

  for (let ry = 0; ry < size; ry++) {
    for (let rx = 0; rx < size; rx++) {

      // Red cannot be in center
      if (rx === center && ry === center) continue;

      let valid = true;

      for (let y = 0; y < size && valid; y++) {
        for (let x = 0; x < size; x++) {
          const color = stateBoard[y][x];
          if (color === "unknown") continue;

          if (!validRelativePosition(color, x, y, rx, ry)) {
            valid = false;
            break;
          }
        }
      }

      if (valid) {
        possible.push({ x: rx, y: ry });
      }
    }
  }

  return possible;
}

renderBoard();


const REVEAL_COLORS = [
  "orange",
  "yellow",
  "green",
  "teal",
  "blue"
];

function simulateReveal(x, y, stateBoard, possibleReds) {
  const outcomes = [];

  for (const color of REVEAL_COLORS) {
    let remaining = 0;

    for (const red of possibleReds) {
      if (validRelativePosition(color, x, y, red.x, red.y)) {
        remaining++;
      }
    }

    // Only consider colors that are actually possible
    if (remaining > 0) {
      outcomes.push(remaining);
    }
  }

  return outcomes;
}

function scoreOutcomes(outcomes) {
  return Math.min(...outcomes);
}

function suggestMoves(stateBoard) {
  const size = stateBoard.length;
  const possibleReds = getPossibleReds(stateBoard);
  const suggestions = [];

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {

      if (stateBoard[y][x] !== "unknown") continue;

      const outcomes = simulateReveal(x, y, stateBoard, possibleReds);
      if (outcomes.length === 0) continue;

      const score = scoreOutcomes(outcomes);

      suggestions.push({
        x,
        y,
        score
      });
    }
  }

  // Lower score = better move
  suggestions.sort((a, b) => a.score - b.score);
  return suggestions;
}
