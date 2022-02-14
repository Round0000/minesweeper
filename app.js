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

  let adj = {};

  // adj.topleft =
  //   adj.top =
  //   adj.topright =
  //   adj.right =
  //   adj.bottomright =
  //   adj.bottom =
  //   adj.bottomleft =
  //   adj.left =
  //     target;

  adj.topleft = {
    x: target.x - 1,
    y: target.y - 1,
  };

  adj.top = {
    x: target.x,
    y: target.y - 1,
  };

  adj.topright = {
    x: target.x + 1,
    y: target.y - 1,
  };

  adj.right = {
    x: target.x + 1,
    y: target.y,
  };

  adj.bottomright = {
    x: target.x + 1,
    y: target.y + 1,
  };

  adj.bottom = {
    x: target.x,
    y: target.y + 1,
  };

  adj.bottomleft = {
    x: target.x - 1,
    y: target.y + 1,
  };

  adj.left = {
    x: target.x - 1,
    y: target.y,
  };

  Object.keys(adj).forEach((el) => {
    if (
      adj[el].x === 0 ||
      adj[el].y === 0 ||
      adj[el].x > fieldSize.cols ||
      adj[el].y > fieldSize.rows
    ) {
      console.log(adj[el], "is out of bounds!");
      adj[el] = null;
    } else {
      document.querySelector(`.cell[data-ref="${adj[el].x}_${adj[el].y}"]`).style.background = "blue"
      field.forEach((cell) => {
        if (cell.x === adj[el].x && cell.y === adj[el].y) {
          cell.seen = true;
        }
      });
    }
  });

  // console.log(target);
  console.table(adj);
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
findAdjacent(field[55]);
displayField(field);


