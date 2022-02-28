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
  level: "beginner",
};

const currentGame = {
  field: [],
  safeCells: [],
  fieldSize: {},
  minescount: 0,
  timer: 0,
  timerActive: false,
};

const best = JSON.parse(localStorage.getItem("minesweeper_best")) || {
  beginner: {
    name: "Anonymous",
    time: 999,
  },
  intermediate: {
    name: "Anonymous",
    time: 999,
  },
  expert: {
    name: "Anonymous",
    time: 999,
  },
};

function initGame() {
  currentGame.field = [];
  currentGame.safeCells = [];
  currentGame.fieldSize.cols = options.fieldSize.cols;
  currentGame.fieldSize.rows = options.fieldSize.rows;
  currentGame.minescount = options.minescount;
  currentGame.timer = 0;
  currentGame.level = options.level;

  ui_frame.classList.remove("victory", "defeat");
  ui_field.innerHTML = "";

  generateField(currentGame.fieldSize);

  displayField(currentGame.field);

  opt_rows.value = currentGame.fieldSize.rows;
  opt_cols.value = currentGame.fieldSize.cols;
  opt_mines.value = currentGame.minescount;
}

function generateField(size) {
  let x = 1;
  let y = 1;

  ui_field.style = `--cols: ${size.cols}; --rows: ${size.rows}; `;

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

function findAdjacentCells(target) {
  target.seen = true;

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
      results = new Set([...results, ...findAdjacentCells(res)]);
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
  cell.classList.add("exploded", "visible");

  currentGame.field.forEach((c) => {
    if (c.mine) {
      ui_field
        .querySelector(`.cell[data-x="${c.x}"][data-y="${c.y}"`)
        .classList.add("mined", "visible");
    }
  });

  ui_frame.classList.add("defeat");
  clearTimer();
}

// In case of victory (all safe cells visible)
function victory() {
  ui_frame.classList.add("victory");
  clearTimer();

  if (currentGame.level && currentGame.timer < best[currentGame.level].time) {
    ui_save_best.classList.remove("hidden");
    ui_save_best.querySelector("label span").innerText = currentGame.level;
    ui_frame.querySelector("#ui_save_best input").focus();
  }
}

function saveNewScore() {
  best[currentGame.level].time = currentGame.timer;
  best[currentGame.level].name = ui_save_best.best_name.value || "Anonymous";
  updateLeaderboard();

  localStorage.setItem("minesweeper_best", JSON.stringify(best));
}

ui_save_best.addEventListener("submit", (e) => {
  e.preventDefault();

  saveNewScore();

  ui_save_best.classList.add("hidden");
  ui_best.classList.remove("hidden");
  ui_menu.querySelector("#opt_best").checked = true;
});

//

function clearTimer() {
  if (!currentGame.timerActive) return;

  clearInterval(currentGame.timerActive);
  currentGame.timerActive = false;
}

ui_field.addEventListener("click", (e) => {
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
      const results = [targetCell, ...findAdjacentCells(targetCell)];

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

// Mouse down on cell
let mousedown = false;

ui_field.addEventListener("mousedown", (e) => {
  if (!e.target.classList.contains("visible") && e.button === 0) {
    mousedown = true;
    ui_frame.classList.add("guessing");
  }
});

document.addEventListener("mouseup", (e) => {
  if (mousedown) {
    mousedown = false;
    ui_frame.classList.remove("guessing");
    e.target.click();
  }
});

// Flag a cell
function flagCell(c) {
  if (c.classList.contains("flagged")) {
    currentGame.minescount++;
    displayCount(ui_minescount, currentGame.minescount);
    c.classList.remove("flagged");

    if (!opt_marks.checked) return;
    c.classList.add("hypothese");
  } else if (c.classList.contains("hypothese")) {
    c.classList.remove("hypothese");
  } else {
    c.classList.add("flagged");
    currentGame.minescount--;
    displayCount(ui_minescount, currentGame.minescount);
  }
}

// Right click to set a flag/hypothese
document.addEventListener("contextmenu", (e) => {
  e.preventDefault();

  if (
    e.target.classList.contains("cell") &&
    !e.target.classList.contains("visible")
  ) {
    flagCell(e.target);
  }
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

// Custom field options
ui_menu.addEventListener("click", (e) => {
  console.log(e.target);

  if (e.target.matches(".menu_toggler")) {
    e.target.parentElement
      .querySelector(".ui_menu_subnav")
      .classList.toggle("hidden");
  }

  if (!e.target.classList.contains("opt_level")) return;

  const presets = {
    opt_beginner: {
      rows: 9,
      cols: 9,
      mines: 10,
      level: "beginner",
    },
    opt_intermediate: {
      rows: 16,
      cols: 16,
      mines: 40,
      level: "intermediate",
    },
    opt_expert: {
      rows: 16,
      cols: 30,
      mines: 99,
      level: "expert",
    },
  };

  let l = e.target.id;
  l = l === "" ? e.target.querySelector("input").id : l;

  console.log(l);

  options.fieldSize.rows = presets[e.target.id].rows;
  options.fieldSize.cols = presets[e.target.id].cols;
  options.minescount = presets[e.target.id].mines;
  options.level = presets[e.target.id].level;

  document.querySelector(".ui_menu_subnav").classList.add("hidden");

  initGame();
});

const opt_form = document.querySelector("#ui_menu_custom form");

opt_form.addEventListener("submit", (e) => {
  e.preventDefault();

  options.fieldSize.rows = opt_form.rows.value;
  options.fieldSize.cols = opt_form.cols.value;
  options.minescount = opt_form.mines.value;
  options.level = "";

  ui_menu.querySelector(".ui_menu_subnav").classList.add("hidden");

  if (currentGame.timerActive) {
    clearInterval(currentGame.timerActive);
    currentGame.timerActive = false;
  }
  initGame();
});

// Display highscores
opt_best.addEventListener("click", (e) => {
  ui_best.classList.toggle("hidden");
});

function updateLeaderboard() {
  ui_best_beginner.querySelector(".best_time span").innerText =
    best.beginner.time;
  ui_best_beginner.querySelector(".best_name").innerText = best.beginner.name;
  ui_best_intermediate.querySelector(".best_time span").innerText =
    best.intermediate.time;
  ui_best_intermediate.querySelector(".best_name").innerText =
    best.intermediate.name;
  ui_best_expert.querySelector(".best_time span").innerText = best.expert.time;
  ui_best_expert.querySelector(".best_name").innerText = best.expert.name;
}

updateLeaderboard();

//

window.onload = () => {
  initGame();
};
//
//

// Start button

document.addEventListener("click", (e) => {
  if (e.target.matches(".btn_new_game")) {
    clearTimer();
    initGame();
    ui_menu.querySelector(".ui_menu_subnav").classList.add("hidden");
  }
});

document.addEventListener("keyup", (e) => {
  if (e.key === "F2") {
    clearTimer();
    initGame();
  }
});
