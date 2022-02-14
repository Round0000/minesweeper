const field = [];

let fieldSize = {
  cols: 10,
  rows: 10,
};

function generateField(size) {
  let x = 1;
  let y = 1;

  for (let i = 0; i < size.cols * size.rows; i++) {
    field.push({
      x: x,
      y: y,
    });

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
  console.log("target : ", target);

  let adj = [];

  // adj.topleft =
  //   adj.top =
  //   adj.topright =
  //   adj.right =
  //   adj.bottomright =
  //   adj.bottom =
  //   adj.bottomleft =
  //   adj.left =
  //     target;

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

  console.log(adj);


  adj.forEach((el) => {
    if (
      el.x === 0 ||
      el.y === 0 ||
      el.x > fieldSize.cols ||
      el.y > fieldSize.rows
    ) {
      el = null;
    } else {
      console.log(el.x, el.y);
      document.querySelector(
        `.cell[data-ref="${el.x}_${el.y}"]`
      ).style.background = "pink";

      const cellObj = field.find(cell => cell.x === el.x && cell.y === el.y);

      cellObj.seen = true;


    }
  });

}

//

function displayField(field) {
  field.forEach((cell) => {
    const c = document.createElement("DIV");
    c.classList.add("cell");
    c.dataset.ref = cell.x + "_" + cell.y;
    c.innerText = cell.x + "-" + cell.y;
    ui_field.append(c);
  });
}

//
generateField(fieldSize);
displayField(field);
findAdjacent(field[29]);
