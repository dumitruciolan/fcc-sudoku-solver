// -----[Keep the tests in the same order!]-----
// if additional are added, keep them at the very end!

const chai = require("chai"),
  { assert } = chai;
let Solver;

suite("Functional Tests", () => {
  // DOM already mocked -- load sudoku solver then run tests
  suiteSetup(() => (Solver = require("../public/sudoku-solver.js")));

  suite("Text area and sudoku grid update automatically", () => {
    // Entering a valid number in the text area populates
    // the correct cell in the sudoku grid with that number
    test("Valid number in text area populates correct cell in grid", done => {
      // erase current data
      Solver.clearInput();
      document.querySelector("#text-input").value = "123";
      Solver.textBoxChanged();

      const testArr = Array.from(document.querySelectorAll(".sudoku-input"))
        .map(cell => cell.value)
        .filter(str => str);
      assert.deepEqual(testArr, ["1", "2", "3"]);
      done();
    });

    // Entering a valid number in the grid automatically
    // updates the puzzle string in the text area
    test("Valid number in grid updates the puzzle string in the text area", done => {
      const gridCells = Array.from(
          document.querySelectorAll(".sudoku-input")
        ).map(cell => cell),
        expected =
          "123..............................................................................";

      // erase current data
      Solver.clearInput();
      (gridCells[0].value = "1"),
        (gridCells[1].value = "2"),
        (gridCells[2].value = "3");

      Solver.gridChanged();
      assert.strictEqual(document.querySelector("#text-input").value, expected);
      done();
    });
  });

  suite("Clear and solve buttons", () => {
    // Pressing the "Clear" button clears the sudoku grid and the text area
    test("Function clearInput()", done => {
      const sudokuInputs = document.querySelectorAll(".sudoku-input");

      // Simulate insertion in text area, set grid & button click
      document.querySelector("#text-input").value = Solver.puzzle;
      Solver.textBoxChanged();
      Solver.clearInput();

      assert.deepEqual(document.querySelector("#text-input").value, "");
      assert.deepEqual(sudokuInputs.value, undefined);
      done();
    });

    // Pressing the "Solve" button solves the puzzle
    // and fills in the grid with the solution
    test("Function solveButtonPressed()", done => {
      const textBox = document.querySelector("#text-input");
      textBox.value = Solver.puzzle;

      Solver.solveButtonPressed();
      assert.deepEqual(textBox.value, Solver.solution);
      done();
    });
  });
});
