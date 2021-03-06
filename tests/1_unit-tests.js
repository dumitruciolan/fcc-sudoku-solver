// -----[Keep the tests in the same order!]-----
// if additional are added, keep them at the very end!

const chai = require("chai"),
  jsdom = require("jsdom"),
  { assert } = chai,
  { JSDOM } = jsdom;
let Solver;

suite("Unit Tests", () => {
  suiteSetup(() => {
    // Mock the DOM for testing and load Solver
    return JSDOM.fromFile("./views/index.html").then(dom => {
      global.window = dom.window;
      global.document = dom.window.document;

      Solver = require("../public/sudoku-solver.js");
    });
  });

  // Only the digits 1-9 are accepted as valid input for the puzzle grid
  suite("Function validSudokuInput(input)", () => {
    test('Valid "1-9" characters', done => {
      const input = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
      input.forEach((el, i) =>
        assert.strictEqual(Solver.validSudokuInput(el), input[i])
      );
      done();
    });

    // Invalid characters or numbers are not
    // accepted as valid input for the puzzle grid
    test('Invalid characters (anything other than "1-9") are not accepted', done => {
      const input = ["!", "a", "/", "+", "-", "0", "10", 0, "."];
      input.forEach((el, _) =>
        assert.strictEqual(Solver.validSudokuInput(el), false)
      );
      done();
    });
  });

  suite("Function textBoxChanged()", () => {
    test("Parses a valid puzzle string into an object", done => {
      document.querySelector("#text-input").value = Solver.puzzle;
      assert.isArray(Solver.textBoxChanged());
      done();
    });

    // Puzzles that are not 81 numbers/periods long show the message "Error: Expected
    // puzzle to be 81 characters long." in the `div` with the id "error-msg"
    test("Shows an error for puzzles that are not 81 numbers long", done => {
      const shortStr = "83.9.....6.62.71...9......1945....4.37.4.3..6..";
      const longStr = `${Solver.puzzle}.`;
      const errorMsg = "Error: Expected puzzle to be 81 characters long.";
      const errorDiv = document.querySelector("#error-msg");

      // check if error message is displayed for shorter string
      document.querySelector("#text-input").value = shortStr;
      Solver.textBoxChanged();
      assert.strictEqual(errorDiv.innerText, errorMsg);

      // check if error message is displayed for longer string
      Solver.clearInput();
      Solver.textBoxChanged(longStr);
      assert.strictEqual(errorDiv.innerText, errorMsg);
      done();
    });
  });

  suite("Function solveButtonPressed()", () => {
    // Valid complete puzzles pass
    test("Valid puzzles pass", done => {
      document.querySelector("#text-input").value = Solver.solution;
      Solver.solveButtonPressed();

      assert.equal(document.querySelector("#error-msg").innerText, "");
      done();
    });

    // Invalid complete puzzles fail
    test("Invalid puzzles fail", done => {
      const errorBox = document.querySelector("#error-msg");
      document.querySelector("#text-input").value =
        "779235418851496372432178956174569283395842761628713549283657194516924837947381625";

      Solver.solveButtonPressed();
      assert.equal(errorBox.innerText, "Invalid Solution.");
      done();
    });

    // Returns the expected solution for a valid, incomplete puzzle
    test("Returns the expected solution for an incomplete puzzle", done => {
      const textBox = document.querySelector("#text-input");
      textBox.value = Solver.puzzle;

      Solver.solveButtonPressed();
      assert.deepEqual(textBox.value, Solver.solution);
      done();
    });
  });
});
