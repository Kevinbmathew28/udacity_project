# Flask Sudoku App Instructions

## Project overview

This repository contains a Flask-based Sudoku game with puzzle generation, validation, hint support, and a web UI.

There are two related code paths in the `starter/` folder:
- `starter/app/` contains the current Flask application and Sudoku game logic used by the web app.
- `starter/sudoku/` contains the backend Sudoku generator, solver, and validation utilities imported by the Flask app.
- `starter/sudoku_logic.py` is a separate legacy Sudoku helper module and is not required by the current Flask app.

## Run the app


1. Activate the virtual environment:
   ```powershell
    py -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```
2. Install dependencies (if not already installed):
   ```powershell
   pip install -r requirements.txt
   ```

   3. Open a terminal in the workspace root:
   ```powershell
   cd C:\Users\arti.rajendra.jaware\Documents\GitHub\github-copilot-python\starter
   ```

4. Start the Flask app:
   ```powershell
   python app.py
   ```
5. Open a browser at `http://127.0.0.1:5000/`.

## Key files

- `starter/app.py`
  - Application entrypoint.
  - Imports `create_app()` from `starter/sudoku/__init__.py` and starts the Flask server.

- `starter/app/__init__.py`
  - Creates the Flask app instance.
  - Registers the main blueprint from `starter/app/routes.py`.

- `starter/app/routes.py`
  - Defines frontend routes and JSON API endpoints:
    - `/` returns the main HTML game page.
    - `/api/new` starts a new game for the selected difficulty.
    - `/api/validate` checks a user move against the stored solution.
    - `/api/check` verifies the current board state.
    - `/api/hint` returns the next hint and locks that cell.

- `starter/app/sudoku.py`
  - Generates completed Sudoku grids and puzzles with unique solutions.
  - Validates board completion.
  - Finds incorrect cells.
  - Provides a hint for the next empty or wrong cell.

- `starter/sudoku/generator.py`
  - Creates a full Sudoku solution and removes cells to form a puzzle.
  - Ensures puzzles have a unique valid solution.

- `starter/sudoku/solver.py`
  - Implements backtracking-based solver utilities.
  - Checks whether a move is safe and counts potential solutions.

- `starter/sudoku/validation.py`
  - Validates an individual move within a board.

## Running tests

From `starter/`, run:
```powershell
pytest
```

Test files are located in `starter/tests/`.

## Notes

- The app stores current game state in Flask session variables: `puzzle`, `solution`, `fixed`, and `difficulty`.
- Difficulty levels are managed by the generator logic and control how many cells are left blank.
- The front-end logic and game UI live inside `starter/static/` and `starter/templates/index.html`.

## Good starting points for development

- `starter/app/routes.py` for API behavior.
- `starter/app/sudoku.py` for game logic and puzzle generation.
- `starter/tests/` to verify behavior and add new coverage.
