// import { puzzlesAndSolutions } from './puzzle-strings.js';
const textArea = document.getElementById("text-input");

// Load a simple puzzle into the text area
document.addEventListener("DOMContentLoaded", () => {
  textArea.value =
    "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";
  textBoxChanged();
});

let validateRegex = /^[0-9.]*$/,
  solveButton = document.querySelector("#solve-button"),
  clearButton = document.querySelector("#clear-button"),
  cells = document.querySelectorAll(".sudoku-input"),
  textBox = document.querySelector("#text-input"),
  errorBox = document.querySelector("#error-msg");

let textBoxChanged = () => {
  errorBox.innerText = "";

  //   user story 5
  if (validateRegex.test(textBox.value) === false)
    return errorBox.innerText = "Error: Invalid Characters";

  // user story 9
  if (textBox.value.length !== 81)
    return errorBox.innerText = "Error: Expected puzzle to be 81 characters long.";

  //   user story 2
  let textBoxValues = textBox.value.split("");
  textBoxValues.forEach((value, index) => cells[index].value = value);
};

let gridChanged = () => {
  let textString = "";

  // user story 4
  cells.forEach(cell => textString += cell.value.toString());

  //   user story 6
  errorBox.innerText = "";
  if (validateRegex.test(textString) === false)
    return errorBox.innerText = "Error: Invalid Characters";

  //   user story 9
  if (textString.length !== 81)
    return errorBox.innerText = "Error: Expected puzzle to be 81 characters long.";

  textBox.value = textString;
};

// check if number placement is allowed
let canPlace = (board, row, col, value) => {
  // Check Column
  for (let i = 0; i < 9; i++)
    if (board[i][col] === value) return false;

  // Check Row
  for (let j = 0; j < 9; j++)
    if (board[row][j] === value) return false;

  // Check Box Placement
  let boxTopRow = parseInt(row / 3) * 3; // Returns index of top row of box (0, 3, or 6)
  let boxLeftColumn = parseInt(col / 3) * 3; // Returns index of left column of box (0, 3 or 6)

  for (let k = boxTopRow; k < boxTopRow + 3; k++) // Looks through rows
    for (let l = boxLeftColumn; l < boxLeftColumn + 3; l++) // Looks through columns
      if (board[k][l] == value) return false;

  return true;
};

// attempt to solve the puzzle from a given cell
let solveFromCell = (board, row, col) => {
  // If on column 9 (outside row), move to next row and reset column to zero
  if (col === 9) {
    col = 0;
    row++;
  }

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
      if (solveFromCell(board, row, col + 1) != false) return board;
      else board[row][col] = ".";
    }
  }

  // If not found a solution yet, return false
  return false;
};

// recursive backtracking sudoku algo step 2
let generateBoard = values => {
  let board = [[], [], [], [], [], [], [], [], []],
    boardRow = -1;

  for (let i = 0; i < values.length; i++) {
    if (i % 9 === 0) boardRow += 1;
    board[boardRow].push(values[i]);
  }

  return board;
};

// recursive backtracking sudoku algo
let solveButtonPressed = () => {
  let textBoxValues = textBox.value.split(""),
    originalBoard = generateBoard(textBoxValues),
    solution = solveFromCell(originalBoard, 0, 0);

  // user story 7
  errorBox.innerText = "";
  if (solution === false) return errorBox.innerText = "No Solution :(";

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
cells.forEach(cell => cell.oninput = gridChanged);

// recursive backtracking algo step 1
solveButton.onclick = solveButtonPressed;

// user story 10
clearButton.onclick = () => {
  textBox.value = "";
  errorBox.innerText = "";
  cells.forEach(cell => cell.value = "");
};

// Export your functions for testing in Node.
// `try` prevents errors on  the client side
try {
  module.exports = {
    
  };
} catch (e) { }
