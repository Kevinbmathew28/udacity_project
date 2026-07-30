# Sudoku Flask Project Instructions

## Project Overview
This is a simple Sudoku web application built with Python and Flask, with a vanilla JavaScript frontend and CSS styling. The app generates Sudoku puzzles on the server, renders a 9x9 grid in the browser, and allows users to fill the board and check their solution.

The basic flow is:
- Flask serves `index.html` and exposes API endpoints at `/new` and `/check`
- `sudoku_logic.py` generates a completed Sudoku board and removes cells to create a puzzle
- `main.js` renders the board, handles user input, and sends board state back to the backend for validation

The project should remain simple, maintainable, and easy to extend with features like difficulty selection, timers, and leaderboards.

## Backend Coding Guidelines (Flask / Python)
- Keep backend logic in `starter/app.py` and Sudoku generation in `starter/sudoku_logic.py`.
- Use Flask routes for JSON APIs only; keep frontend rendering in the browser.
- Keep route handlers small and focused:
  - `/` should serve the main HTML page with `render_template`
  - `/new` should generate a new board and return a JSON puzzle
  - `/check` should compare submitted board state against the stored solution and return incorrect coordinates
- Store current puzzle and solution in a simple in-memory structure only for the running session.
- Do not expose the solution to the client.
- Validate input on the backend in the `/check` route before using it.
- Use `jsonify` for responses and return proper HTTP status codes for errors.
- Keep dependency usage minimal: only Flask is required.

## Frontend Guidelines (HTML / CSS / JavaScript)
- Keep `starter/templates/index.html` simple and semantic.
- Use `starter/static/styles.css` for layout and visual state styling.
- Use `starter/static/main.js` to:
  - create the 9x9 board DOM programmatically
  - render received puzzle values
  - sanitize user input so only digits 1-9 are allowed
  - handle the `New Game` and `Check Solution` buttons
  - send fetch requests to `/new` and `/check`
  - show user feedback for invalid entries, success, or errors
- Prefilled puzzle cells should be disabled and styled differently from editable cells.
- Highlight incorrect cells after a validation check.
- Keep frontend logic contained in small helper functions for readability.

## Sudoku Logic Guidelines (Generation, Solving, Uniqueness)
- Use a backtracking solver to generate a complete valid Sudoku solution.
- Fill the board in random order so puzzle generation is not deterministic.
- After generating the full board, remove cells to create the puzzle.
- Enforce unique-solution puzzles by verifying uniqueness during removal:
  - temporarily blank a candidate cell
  - run a solver that counts valid completions up to 2
  - restore the cell if the board has more than one valid solution
- Keep puzzle generation fast enough for interactive use, but prioritize correctness.
- Clearly separate the following responsibilities:
  - board creation and representation
  - safety checks (`row`, `column`, `3x3 box`)
  - board filling
  - solution counting and uniqueness checking
- Keep `generate_puzzle()` returning both the puzzle and the complete solution.
- Avoid storing the solution on the frontend or returning it in API payloads.

## Testing Guidelines
- Add unit tests for Sudoku generation and validation in `starter/sudoku_logic.py`.
- Test that generated boards are valid Sudoku solutions.
- Test that puzzle boards do not violate row/column/box constraints.
- Test solver behavior for both solvability and uniqueness counting.
- Add tests for Flask routes if possible by using the Flask test client.
- Validate that `/new` returns a 9x9 board and that `/check` returns the correct incorrect positions.
- Keep tests focused, deterministic, and easy to run.
- Use clear, descriptive test names.

## Code Quality Standards
- Follow consistent naming and formatting.
- Keep functions short, with one clear purpose each.
- Add comments only where necessary to explain non-obvious logic.
- Prefer explicit structure over clever shortcuts.
- Avoid duplicate logic between backend and frontend.
- Keep the Python code readable and idiomatic.
- Use helper functions for repeated tasks like board traversal and validation.

## Error Handling Practices
- Handle invalid user input gracefully on both frontend and backend.
- On the frontend:
  - prevent users from typing non-numeric characters
  - display meaningful error messages in the UI area
- On the backend:
  - validate incoming JSON payloads in `/check`
  - return useful error objects like `{ "error": "No game in progress" }`
  - use HTTP 400 for client errors
- Keep the client-side error display simple and visible.
- Avoid app crashes caused by malformed requests.

## Suggested Future Features
- Add difficulty selection to the UI and pass the clue count to `/new`.
- Add a timer that tracks elapsed solving time.
- Add scoring based on time, difficulty, and mistakes.
- Store top scores or leaderboards in local storage or optionally on a backend.
- Add a hint system that reveals one correct digit.
- Add input validation that highlights row/column/box conflicts as the user types.
- Add a restart button that resets the current puzzle state.
- Add mobile responsiveness and keyboard navigation for better usability.
- Add a persistent scoreboard or history store.

## General Guidance for Copilot Suggestions
- Prefer clear, modular code that fits the existing Flask + JS structure.
- Suggest changes that improve correctness first, then usability.
- Avoid adding unnecessary dependencies.
- Propose backend changes in `starter/app.py` and `starter/sudoku_logic.py` when solving logic or API behavior is involved.
- Propose frontend changes in `starter/static/main.js`, `starter/static/styles.css`, and `starter/templates/index.html` when improving the UI.
- Keep Copilot suggestions aligned with a minimal, maintainable Flask application design.

---

These instructions are designed to help GitHub Copilot suggest changes that match the current Sudoku project structure and goals.