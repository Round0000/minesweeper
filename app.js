function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const field = [];
const safeCells = [];

let fieldSize = {
  cols: 10,
  rows: 10,
};

function generateField(size) {
  let x = 1;
  let y = 1;

  for (let i = 0; i < size.cols * size.rows; i++) {
    const cell = {
      x: x,
      y: y,
      mine: getRandom(0, 22) === 0,
    };

    if (!cell.mine) {
      safeCells.push(cell);
    }

    field.push(cell);

    if (x < 10) {
      x += 1;
    } else {
      x = 1;
      y += 1;
    }
  }
}

function findAdjacent(target) {
  target.seen = true;
  // console.log("target : ", target);

  let adj = [];

  adj.push({
    x: target.x - 1,
    y: target.y - 1,
  });

  adj.push({
    x: target.x,
    y: target.y - 1,
  });

  adj.push({
    x: target.x + 1,
    y: target.y - 1,
  });

  adj.push({
    x: target.x + 1,
    y: target.y,
  });

  adj.push({
    x: target.x + 1,
    y: target.y + 1,
  });

  adj.push({
    x: target.x,
    y: target.y + 1,
  });

  adj.push({
    x: target.x - 1,
    y: target.y + 1,
  });

  adj.push({
    x: target.x - 1,
    y: target.y,
  });

  let results = [];

  adj.forEach((el) => {
    if (
      el.x === 0 ||
      el.y === 0 ||
      el.x > fieldSize.cols ||
      el.y > fieldSize.rows
    ) {
      el = null;
    } else {
      const cellObj = field.find((cell) => cell.x === el.x && cell.y === el.y);

      if (!cellObj.mine && !cellObj.seen) {
        cellObj.seen = true;
        results.push(cellObj);
        cellObj.adjMines = findAdjacentMines(cellObj);
      }
    }
  });

  // results.forEach(
  //   (res) => (results = new Set([...results, ...findAdjacent(res)]))
  // );

  results.forEach((res) => {
    if (!res.adjMines) {
      results = new Set([...results, ...findAdjacent(res)]);
    }
  });

  return results;
}

// Find adjacent mines
function findAdjacentMines(cell) {
  const adj = [];

  adj.push({
    x: cell.x - 1,
    y: cell.y - 1,
  });

  adj.push({
    x: cell.x,
    y: cell.y - 1,
  });

  adj.push({
    x: cell.x + 1,
    y: cell.y - 1,
  });

  adj.push({
    x: cell.x + 1,
    y: cell.y,
  });

  adj.push({
    x: cell.x + 1,
    y: cell.y + 1,
  });

  adj.push({
    x: cell.x,
    y: cell.y + 1,
  });

  adj.push({
    x: cell.x - 1,
    y: cell.y + 1,
  });

  adj.push({
    x: cell.x - 1,
    y: cell.y,
  });

  const minedCells = [];

  adj.forEach((el) => {
    const cellObj = field.find((cell) => cell.x === el.x && cell.y === el.y);

    if (cellObj && cellObj.mine) {
      minedCells.push(cellObj);
    }
  });

  return minedCells.length;
}

//

function displayField(field) {
  field.forEach((cell) => {
    const c = document.createElement("DIV");
    c.classList.add("cell");
    c.dataset.x = cell.x;
    c.dataset.y = cell.y;

    if (cell.mine) {
      c.classList.add("mined");
    }
    ui_field.append(c);
  });
}

//
generateField(fieldSize);
displayField(field);

//

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("cell")) {
    const targetCell = field.find(
      (c) => c.x == e.target.dataset.x && c.y == e.target.dataset.y
    );

    if (e.target.classList.contains("flagged")) {
      e.target.classList.remove("flagged");
    }

    targetCell.seen = true;

    console.log(targetCell);

    if (targetCell.mine) return "mine";

    if (findAdjacentMines(targetCell)) {
      e.target.classList.add("visible");
      const adjMines = findAdjacentMines(targetCell);
      if (adjMines) {
        e.target.innerText = adjMines;
      }
    } else {
      const results = [targetCell, ...findAdjacent(targetCell)];

      console.log(results);

      results.forEach((res) => {
        const visibleCell = document.querySelector(
          `.cell[data-x="${res.x}"][data-y="${res.y}"]`
        );

        e.target.dataset.adjmines = findAdjacentMines(targetCell);

        visibleCell.classList.add("visible");
        visibleCell.classList.remove("flagged");

        const adjMines = findAdjacentMines(res);
        if (adjMines) {
          visibleCell.innerText = adjMines;
        }
      });
    }

    e.target.classList.add("visible");

    console.log("initial query :", targetCell);

    if (!checkIfVictory()) {
      console.log("BRAVO !");
    }
  }
});

function checkIfVictory() {
  const remainingSafeCells = safeCells.filter((c) => !c.seen);
  return remainingSafeCells.length;
}

// Flag a cell
function flagCell(c) {
  c.classList.add("flagged");
}

document.addEventListener("contextmenu", (e) => {
  if (e.target.classList.contains("cell")) {
    e.preventDefault();
    flagCell(e.target);
  }
});
