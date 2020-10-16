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
      const textArea = document.getElementById("text-input");
      textArea.value = "123";
      Solver.setGrid(textArea.value);
      const testArr = Array.from(document.querySelectorAll(".sudoku-input"))
        .map(cell => cell.value)
        .filter(str => str);
      const expected = ["1", "2", "3"];

      assert.deepStrictEqual(testArr, expected);
      done();
    });

    // Entering a valid number in the grid automatically updates
    // the puzzle string in the text area
    test("Valid number in grid updates the puzzle string in the text area", done => {
      const textArea = document.getElementById("text-input");
      const gridCells = Array.from(
        document.querySelectorAll(".sudoku-input")
      ).map(cell => cell);
      gridCells[0].value = "1";
      gridCells[1].value = "2";
      gridCells[2].value = "3";
      const expected =
        "123..............................................................................";

      Solver.setTextArea();
      assert.strictEqual(textArea.value, expected);
      done();
    });
  });

  suite("Clear and solve buttons", () => {
    const input =
      "..9..5.1.85.4....2432......1...69.83.9.....6.62.71...9......1945....4.37.4.3..6..";

    // Pressing the "Clear" button clears the sudoku grid and the text area
    test("Function clearInput()", done => {
      const sudokuInputs = document.querySelectorAll(".sudoku-input"),
        textArea = document.getElementById("text-input");

      // Simulate insertion in text area, set grid & button click
      textArea.value = input;
      Solver.setGrid(input);
      Solver.clearInput();

      assert.deepStrictEqual(textArea.value, "");
      assert.deepStrictEqual(sudokuInputs.value, undefined);
      done();
    });

    // Pressing the "Solve" button solves the puzzle and
    // fills in the grid with the solution
    test("Function showSolution(solve(input))", done => {
      const output =
          "769235418851496372432178956174569283395842761628713549283657194516924837947381625",
        textArea = document.getElementById("text-input");

      textArea.value = input;
      Solver.showSolution(Solver.solve(input));
      assert.deepStrictEqual(textArea.value, output);
      done();
    });
  });
});
