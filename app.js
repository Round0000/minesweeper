function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const options = {
  fieldSize: {
    cols: 9,
    rows: 9,
  },
  minescount: 10,
};

const currentGame = {
  field: [],
  safeCells: [],
  fieldSize: {},
  minescount: 0,
  timer: 0,
  timerActive: false,
};

function initGame() {
  currentGame.field = [];
  currentGame.safeCells = [];
  currentGame.fieldSize.cols = options.fieldSize.cols;
  currentGame.fieldSize.rows = options.fieldSize.rows;
  currentGame.minescount = options.minescount;
  currentGame.timer = 0;
  ui_field.innerHTML = "";

  generateField(currentGame.fieldSize);

  displayField(currentGame.field);
}

function generateField(size) {
  let x = 1;
  let y = 1;

  for (let i = 0; i < size.cols * size.rows; i++) {
    const cell = {
      x: x,
      y: y,
    };

    currentGame.field.push(cell);

    if (x < currentGame.fieldSize.cols) {
      x += 1;
    } else {
      x = 1;
      y += 1;
    }
  }

  for (i = 0; i < currentGame.minescount; i++) {
    const f = currentGame.field;
    const c = f[getRandom(0, f.length - 1)];

    if (!c.mine) {
      c.mine = true;
    } else {
      i--;
    }
  }

  currentGame.safeCells = currentGame.field.filter((el) => !el.mine);

  displayCount(ui_minescount, currentGame.minescount);
  displayCount(ui_timecount, currentGame.timer);
}

function findAdjacent(target) {
  target.seen = true;
  //

  const adj = mapCells(target);

  let results = [];

  adj.forEach((el) => {
    if (
      el.x === 0 ||
      el.y === 0 ||
      el.x > currentGame.fieldSize.cols ||
      el.y > currentGame.fieldSize.rows
    ) {
      el = null;
    } else {
      const cellObj = currentGame.field.find(
        (cell) => cell.x === el.x && cell.y === el.y
      );

      if (!cellObj.mine && !cellObj.seen) {
        cellObj.seen = true;
        results.push(cellObj);
        cellObj.adjMines = findAdjacentMines(cellObj);
      }
    }
  });

  results.forEach((res) => {
    if (!res.adjMines) {
      results = new Set([...results, ...findAdjacent(res)]);
    }
  });

  return results;
}

// Map of adjacent cells
function mapCells(c) {
  const res = [];

  res.push({
    x: c.x - 1,
    y: c.y - 1,
  });

  res.push({
    x: c.x,
    y: c.y - 1,
  });

  res.push({
    x: c.x + 1,
    y: c.y - 1,
  });

  res.push({
    x: c.x + 1,
    y: c.y,
  });

  res.push({
    x: c.x + 1,
    y: c.y + 1,
  });

  res.push({
    x: c.x,
    y: c.y + 1,
  });

  res.push({
    x: c.x - 1,
    y: c.y + 1,
  });

  res.push({
    x: c.x - 1,
    y: c.y,
  });

  return res;
}

// Find adjacent mines
function findAdjacentMines(cell) {
  const adj = mapCells(cell);

  const minedCells = [];

  adj.forEach((el) => {
    const cellObj = currentGame.field.find(
      (cell) => cell.x === el.x && cell.y === el.y
    );

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

    ui_field.append(c);
  });
}

// In case of defeat (clicked on a mine)
function defeat(cell) {
  cell.classList.add("mined");
  ui_frame.classList.add("defeat");
  clearInterval(currentGame.timerActive);
  currentGame.timerActive = false;

  setTimeout(() => {
    initGame();
    ui_frame.classList.remove("defeat");
  }, 1000);
}

// In case of victory (all safe cells visible)
function victory() {
  ui_frame.classList.add("victory");
  clearInterval(currentGame.timerActive);
  currentGame.timerActive = false;

  setTimeout(() => {
    initGame();
    ui_frame.classList.remove("victory");
  }, 2000);
}

//

document.addEventListener("click", (e) => {
  if (
    e.target.classList.contains("cell") &&
    !e.target.classList.contains("flagged")
  ) {
    const targetCell = currentGame.field.find(
      (c) => c.x == e.target.dataset.x && c.y == e.target.dataset.y
    );

    if (targetCell.mine) {
      defeat(e.target);
      return;
    }

    if (e.target.classList.contains("flagged")) {
      e.target.classList.remove("flagged");
    }
    if (e.target.classList.contains("hypothese")) {
      e.target.classList.remove("hypothese");
    }

    targetCell.seen = true;
    e.target.classList.add("visible");

    if (findAdjacentMines(targetCell)) {
      const adjMines = findAdjacentMines(targetCell);
      e.target.classList.add("visible");
      if (adjMines) {
        e.target.dataset.adjmines = adjMines;
        e.target.innerText = adjMines;
      }
    } else {
      const results = [targetCell, ...findAdjacent(targetCell)];

      results.forEach((res) => {
        const visibleCell = document.querySelector(
          `.cell[data-x="${res.x}"][data-y="${res.y}"]`
        );

        visibleCell.classList.add("visible");
        visibleCell.classList.remove("flagged", "hypothese");

        const adjMines = findAdjacentMines(res);
        if (adjMines) {
          visibleCell.innerText = adjMines;
          visibleCell.dataset.adjmines = findAdjacentMines(res);
        }
      });
    }

    if (!currentGame.timerActive && currentGame.timer === 0) {
      currentGame.timerActive = setInterval(() => {
        currentGame.timer++;
        displayCount(ui_timecount, currentGame.timer);
      }, 1000);
    }

    if (!currentGame.safeCells.filter((c) => !c.seen).length) {
      victory();
    }
  }
});

// Flag a cell
function flagCell(c) {
  if (c.classList.contains("flagged")) {
    c.classList.replace("flagged", "hypothese");
    currentGame.minescount++;
    displayCount(ui_minescount, currentGame.minescount);
  } else if (c.classList.contains("hypothese")) {
    c.classList.remove("hypothese");
  } else {
    c.classList.add("flagged");
    currentGame.minescount--;
    displayCount(ui_minescount, currentGame.minescount);
  }
}

document.addEventListener("contextmenu", (e) => {
  e.preventDefault();

  if (
    e.target.classList.contains("cell") &&
    !e.target.classList.contains("visible")
  ) {
    flagCell(e.target);
  }
});

// Start button
ui_start_btn.addEventListener("click", (e) => {
  clearInterval(currentGame.timerActive);
  currentGame.timerActive = false;
  initGame();
});

// Display counts
function displayCount(canvas, count) {
  if (count < 0) {
    currentGame.minescount = 0;
    return;
  }

  count = count < 100 && count >= 10 ? "0" + count : count;
  count = count < 10 ? "00" + count : count;

  const numbers = count.toString().split("");

  let ctx = canvas.getContext("2d");
  canvas.width = ctx.canvas.height * 3 * 0.5652173913;

  let sources = [];

  numbers.forEach((n) => {
    sources.push(document.getElementById("num_" + n));
  });

  ctx.drawImage(
    sources[0],
    0,
    0,
    ctx.canvas.height * 0.5652173913,
    ctx.canvas.height
  );
  ctx.drawImage(
    sources[1],
    ctx.canvas.height * 0.5652173913,
    0,
    ctx.canvas.height * 0.5652173913,
    ctx.canvas.height
  );
  ctx.drawImage(
    sources[2],
    ctx.canvas.height * 2 * 0.5652173913,
    0,
    ctx.canvas.height * 0.5652173913,
    ctx.canvas.height
  );

  canvas.style.opacity = 1;
}

//

window.onload = () => {
  initGame();
};
//
//
