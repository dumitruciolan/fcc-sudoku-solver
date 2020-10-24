const cells = document.querySelectorAll(".sudoku-input"),
  solveBtn = document.querySelector("#solve-button"),
  textBox = document.querySelector("#text-input"),
  errorBox = document.querySelector("#error-msg");

// used by tests
const puzzle =
    "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..",
  solution =
    "769235418851496372432178956174569283395842761628713549283657194516924837947381625";

// Load a simple puzzle into the text area
document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#text-input").value = puzzle;
  textBoxChanged();
});

// verify user character input
const checkInput = string => {
  // user stories 5 & 6
  if (/^[1-9.]*$/.test(string) === false) {
    solveBtn.onclick = "";
    errorBox.innerText = "Error: Invalid Characters";
  }

  // user story 9
  else if (string.length !== 81) {
    solveBtn.onclick = "";
    errorBox.innerText = "Error: Expected puzzle to be 81 characters long.";
  }

  // recursive backtracking algo step 1
  else {
    solveBtn.onclick = solveButtonPressed;
    errorBox.innerText = "";
  }
};
const validSudokuInput = str => parseInt(str) >= 1 && parseInt(str) <= 9 && str;

// textbox string changed?
const textBoxChanged = () => {
  // user story 2
  checkInput(textBox.value);
  let textBoxValues = textBox.value.split("");
  textBoxValues.forEach((value, index) => (cells[index].value = value));
  return textBoxValues;
};

// grid cells changed?
const gridChanged = () => {
  let textString = "";

  // user story 4
  cells.forEach(cell => (textString += cell.value.toString()));
  checkInput(textString);

  return (textBox.value = Array.from(cells).reduce((str, { value }) => {
    value !== "" && validSudokuInput(value) ? (str += value) : (str += ".");
    return str;
  }, ""));
};

// check if number placement is allowed
const canPlace = (board, row, col, value) => {
  // Check Column
  for (let i = 0; i < 9; i++) if (board[i][col] === value) return false;

  // Check Row
  for (let j = 0; j < 9; j++) if (board[row][j] === value) return false;

  // Check Box Placement
  let boxTopRow = parseInt(row / 3) * 3; // Returns index of top row of box (0, 3, or 6)
  let boxLeftColumn = parseInt(col / 3) * 3; // Returns index of left column of box (0/3/6)
  for (
    let k = boxTopRow;
    k < boxTopRow + 3;
    k++ // Looks through rows
  )
    for (
      let l = boxLeftColumn;
      l < boxLeftColumn + 3;
      l++ // Looks through columns
    )
      if (board[k][l] == value) return false;

  return true;
};

// attempt to solve the puzzle from a given cell
const solveFromCell = (board, row, col) => {
  // If on column 9 (outside row), move to next row and reset column to zero
  if (col === 9) (col = 0), row++;

  // If on row 9 (outside board), the solution is complete, so return the board
  if (row === 9) return board;

  // If already filled out (not empty) then skip to next column
  if (board[row][col] != ".") return solveFromCell(board, row, col + 1);

  // Try placing in values. Start with 1 and check if okay to place in cell.
  // If so,run the algorithm from the next cell (col + 1), and see if false
  // is not returned. A returned board indicates true, since a solution was
  // found. If false is returned  empty out the cell, and try with next value
  for (let i = 1; i < 10; i++) {
    let valueToPlace = i.toString();
    if (canPlace(board, row, col, valueToPlace)) {
      board[row][col] = valueToPlace;
      if (solveFromCell(board, row, col + 1) !== false) return board;
      else board[row][col] = ".";
    }
  }

  // If not found a solution yet, return false
  return false;
};

// recursive backtracking sudoku algo step 2
const generateBoard = values => {
  let board = [[], [], [], [], [], [], [], [], []],
    boardRow = -1;

  for (let i = 0; i < values.length; i++) {
    if (i % 9 === 0) boardRow += 1;
    board[boardRow].push(values[i]);
  }

  return board;
};

// make grid arr unidimensional
const flatten2DArr = arr => {
  let oneDimensionArr = [];
  for (let i = 0; i < arr.length; i++)
    if (typeof arr[i] == "object") oneDimensionArr += flatten2DArr(arr[i]);
    else oneDimensionArr += arr[i];
  return oneDimensionArr;
};

// sum together grid's elements
const addElements = string => {
  string = string.split("");
  let ElemSum = 0;
  for (let i = 0; i < string.length; i++) ElemSum += parseInt(string[i], 10);
  return ElemSum;
};

// recursive backtracking sudoku algo
const solveButtonPressed = () => {
  let textBoxValues = textBox.value.split(""),
    solution = solveFromCell(generateBoard(textBoxValues), 0, 0);

  // user story 7
  errorBox.innerText = "";
  if (solution === false) {
    solveBtn.onclick = console.log(errorBox.innerText);
    errorBox.innerText = "No Solution.";
    return;
  }

  // a grid's elements sum that's smaller / bigger than 405
  // means that a number appears twice on a line, column or
  // in a box. Therefore, the provided solution is invalid.
  else if (addElements(flatten2DArr(solution)) !== 405) {
    solveBtn.onclick = console.log(errorBox.innerText);
    errorBox.innerText = "Invalid Solution.";
    return;
  }

  let solutionString = "";
  for (let i = 0; i < solution.length; i++)
    for (let j = 0; j < solution[i].length; j++)
      solutionString += solution[i][j].toString();

  textBox.value = solutionString;
  textBoxChanged();
};

// user story 1
textBox.oninput = textBoxChanged;

// user story 3
cells.forEach(cell => (cell.oninput = gridChanged));

// user story 10
const clearInput = () => {
  textBox.value = "";
  errorBox.innerText = "";
  cells.forEach(cell => (cell.value = ""));
};
document.querySelector("#clear-button").onclick = clearInput;

// Export your functions for testing in Node.
// `try` prevents errors on  the client side
try {
  module.exports = {
    puzzle,
    solution,
    validSudokuInput,
    textBoxChanged,
    gridChanged,
    canPlace,
    solveButtonPressed,
    clearInput
  };
} catch (e) {
  console.log(e);
}

// get rid of validSudokuInput?
