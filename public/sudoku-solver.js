const textBox = document.querySelector("#text-input"),
  cells = document.querySelectorAll(".sudoku-input"),
  errorBox = document.querySelector("#error-msg"),
  rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
  validateRegex = /^[1-9.]*$/;
let globalBoardArray, textString

document.addEventListener("DOMContentLoaded", () => {
  // Load a simple puzzle into the text area
  textBox.value =
    "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
  textBoxChanged(textBox.value);
});

const gridChanged = function() {
  // user story 4
  cells.forEach(cell => (textString += cell.value.toString()));

  // user story 6
  if (validateRegex.test(textString) === false)
    return (errorBox.innerText = "Error: Invalid Characters");

  // user story 9
  if (textString.length !== 81)
    return (errorBox.innerText =
      "Error: Expected puzzle to be 81 characters long.");

  const [letter, num] = this.id.split(""),
    row = rows.indexOf(letter),
    col = num - 1;

  (errorBox.innerText = ""), (textBox.value = textString);
  globalBoardArray[row][col] = this.value !== "" ? this.value : ".";
};

//   user story 2
const textBoxChanged = str => {
  const textBoxValues = str.split("");

  return cells.forEach((cell, index) =>
    validSudokuInput(textBoxValues[index]) && textBoxValues[index] !== "."
      ? (cell.value = textBoxValues[index])
      : (cell.value = "")
  );
};

const setTextArea = () => {
  textBox.value = Array.from(cells).reduce((str, { value }) => {
    value !== "" && validSudokuInput(value) ? (str += value) : (str += ".");
    return str;
  }, "");
};

const validSudokuInput = str => parseInt(str) >= 1 && parseInt(str) <= 9 && str;

const reference = () => {
  const combine = (a, b) => {
    const combos = [];
    for (let i in a) for (let j in b) combos.push(a[i] + b[j]);

    return combos;
  };

  const rows = ["A", "B", "C", "D", "E", "F", "G", "H", "I"],
    cols = ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
    rowSquare = [["A", "B", "C"], ["D", "E", "F"], ["G", "H", "I"]],
    colSquare = [["1", "2", "3"], ["4", "5", "6"], ["7", "8", "9"]],
    coords = combine(rows, cols),
    rowUnits = rows.map(row => combine(row, cols)),
    colUnits = cols.map(col => combine(rows, col));

  const boxUnits = rowSquare.reduce((acc, curr) => {
    colSquare.forEach((_, j) => acc.push(combine(curr, colSquare[j])));

    return acc;
  }, []);

  const allUnits = rowUnits.concat(colUnits, boxUnits),
    groups = {};

  // Generate an array of the three units (row, col, and box) that
  // contain a single cell/coordinate. Each unit has a length of 9.
  groups.units = coords.reduce((acc, currCell) => {
    acc[currCell] = allUnits.reduce((acc, currArr) => {
      if (currArr.includes(currCell)) acc.push(currArr);

      return acc;
    }, []);

    return acc;
  }, {});

  // Generate a list of peers for each cell/coordinate, which is a list of all
  // cells in the three units *except* the cell itself. E.g.: the peers of C2
  // are the cells in its 3 units except for C2. Each peer list is 20 long.
  groups.peers = coords.reduce((acc, currCell) => {
    const flattenedArr = groups.units[currCell].reduce((acc, currArr) => {
      currArr.forEach(el => acc.push(el));
      return acc;
    }, []);

    acc[currCell] = Array.from(new Set(flattenedArr)).filter(
      el => el !== currCell
    );

    return acc;
  }, {});

  return { coords, groups, allUnits };
};

// Make these available globally
const { coords, groups, allUnits } = reference();

const parsePuzzle = str => {
  // Create a map of the incomplete sudoku puzzle at the beginning
  // of the game with each cell and either the current value or '.'
  errorBox.innerText = "";

  const valueMap = coords.reduce((acc, coord, i) => {
    acc[coord] = str[i];

    return acc;
  }, {});

  // user story 5
  if (validateRegex.test(textBox.value) === false)
    return (errorBox.innerText = "Error: Invalid Characters");

  // user story 9
  if (str.length !== 81)
    return (errorBox.innerText =
      "Error: Expected puzzle to be 81 characters long.");

  return valueMap;
};

// User clicks solve button
const solve = (puzzle = textBox.value) => {
  let inputGrid = parsePuzzle(puzzle);
  // Bail out if the puzzle is not valid
  if (!inputGrid) return null;
  // Filter out cells with no value
  inputGrid = Object.keys(inputGrid).reduce((acc, key) => {
    if (inputGrid[key] !== ".") acc[key] = inputGrid[key];
    return acc;
  }, {});
  // 1-9 for each coordinate
  let outputGrid = coords.reduce((acc, coord) => {
    acc[coord] = "123456789";
    return acc;
  }, {});

  // Loop through the known positions on the input grid
  // and begin eliminating other possibilities for cells
  // without a value -- first pass of constraint propagation
  Object.entries(inputGrid).forEach(
    ([position, value]) =>
      (outputGrid = confirmValue(outputGrid, position, value))
  );

  // If puzzle is complete after first pass, return it
  if (validatePuzzle(outputGrid)) return outputGrid;

  // Guess digits for incomplete puzzle
  return guessDigit(outputGrid);
};

const confirmValue = (grid, pos, val) => {
  grid[pos]
    .replace(val, "")
    .split("")
    .forEach(val => (grid = eliminate(grid, pos, val)));

  return grid;
};

const eliminate = (grid, pos, val) => {
  if (!grid) return false;

  if (!grid[pos].includes(val)) return grid; // Exit if we've already eliminated the value from the grid/cell

  grid[pos] = grid[pos].replace(val, ""); // Set cell value if known, otherwise remove possibility

  // If there are no possibilities we made a wrong guess somewhere
  if (grid[pos].length === 0) return false;
  else if (grid[pos].length === 1)
    // Remove known cell values from all peers recursively
    groups.peers[pos].forEach(peer => {
      grid = eliminate(grid, peer, grid[pos]);
      if (!grid) return false;
    });

  const possibilities = groups.units[pos].reduce(
    (_, unit) =>
      unit
        .map(coord => {
          if (grid[coord] && grid[coord].indexOf(val) > -1) return coord;
        })
        .filter(Boolean),
    []
  );

  // We made a mistake somewhere if there are no possible values for a coordinate
  if (possibilities.length === 0) return false;
  else if (possibilities.length === 1 && grid[possibilities[0]].length > 1)
    if (!confirmValue(grid, possibilities[0], val))
      // There is only one possible position, but the grid still lists
      //  multiple possibilities, confirm the value before removing it
      return false;

  return grid;
};

const guessDigit = grid => {
  // Guess a digit with the fewest number of possibilities
  if (!grid) return false;

  // End if there's a possible valid solution
  if (validatePuzzle(grid)) return grid;

  // Sort by cells with the least number of possibilities
  const possibilities = grid
    .filter(x => x.length > 1)
    .sort((a, b) => a[Object.keys(a)[0]].length - b[Object.keys(b)[0]].length);

  const pos = Object.keys(possibilities[0])[0];

  for (let i in grid[pos]) {
    const val = grid[pos][i];
    const possibleSolution = guessDigit(
      confirmValue(Object.assign({}, grid), pos, val)
    );

    if (possibleSolution) return possibleSolution;
  }
};

const validatePuzzle = puzzle => {
  if (!puzzle) return false;

  const validUnit = "123456789".split("");
  // Create a 2D array of puzzle units with sorted values for each cell
  let puzzleUnits = allUnits.map(unit => unit.map(cell => puzzle[cell]).sort());

  // Check that every puzzle unit matches a valid unit of the digits 1-9
  return puzzleUnits.every(arr => validUnit.every(e => arr.includes(e)));
};

const showSolution = obj => {
  // Only handle cases where the puzzle is valid
  if (obj) {
    const solutionStr = Object.values(obj)
      .join()
      .replace(/\,/g, "");
    textBoxChanged(solutionStr), setTextArea();
  }
};

// user story 10
const clearInput = () => {
  textBox.value = "";
  errorBox.innerText = "";
  cells.forEach(cell => (cell.value = ""));
};
document.querySelector("#clear-button").onclick = clearInput;

// user story 1
textBox.oninput = textBoxChanged;

// user story 3
Array.from(cells).forEach(cell => (cell.oninput = gridChanged));

// recursive backtracking algo step 1
document.querySelector("#solve-button").onclick = () => showSolution(solve());

// Export your functions for testing in Node.
// `try` prevents errors on  the client side
try {
  module.exports = {
    validSudokuInput,
    validatePuzzle,
    parsePuzzle,
    solve,
    setTextArea,
    setGrid: textBoxChanged,
    clearInput,
    showSolution
  };
} catch (e) {
  console.log(e);
}

// clearInput(), showSolution(), solve(input)
