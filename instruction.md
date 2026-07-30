# GitHub Copilot Instructions for Sudoku Application

## Project Overview
This repository contains a modern 9×9 Sudoku web application built with Flask for the Python backend and vanilla JavaScript/CSS for the frontend. The application should feel accessible, responsive, and easy to extend while keeping the core architecture clean and modular.

The application should:
- generate Sudoku puzzles on the backend in `starter/sudoku_logic.py`
- serve the game UI from `starter/templates/index.html`
- manage game state and validation through `starter/static/main.js`
- style the board and interaction states in `starter/static/styles.css`
- keep the backend lightweight with Flask and minimal dependencies

## Code Standards and Architecture

### Refactor Legacy Code to Modern Standards
- Use a modular architecture:
  - keep backend routes and API handling in `starter/app.py`
  - keep Sudoku generation and solving logic in `starter/sudoku_logic.py`
  - keep rendering and browser interactions in `starter/static/main.js`
  - keep styling in `starter/static/styles.css`
- Prefer small, single-purpose functions and avoid large monolithic blocks.
- Keep Python functions testable and avoid side effects where possible.
- In JavaScript, organize logic into reusable helper functions.
- Use comments to explain:
  - non-trivial business logic
  - puzzle generation and solving strategies
  - API input/output expectations
- **Error Handling**: Implement consistent error handling patterns
  - Use try/catch blocks for async operations
  - Validate user inputs at boundaries
  - Provide meaningful error messages to users
  - Log errors appropriately for debugging

### Error Handling
- Validate all user input at boundary points.
- Use `try/catch` for async operations in JavaScript.
- Return clean JSON error responses from Flask, and use HTTP 400 for bad client requests.
- Show user-facing messages for invalid board submission, network errors, and unexpected backend failures.
- Do not crash the app on malformed input.

### Build & Run Requirements
- The application must install cleanly with `pip install -r requirements.txt`.
- It must run via `python app.py` or `flask run` without startup errors.
- Browser developer tools should show no console errors for normal usage.

## User Interface Requirements

### Responsive and Accessible Design
- Use plain CSS only; do not add framework dependencies.
- Ensure the Sudoku board is responsive and mobile-friendly.
- Keep the grid centered and proportional on all screen sizes.
- Use `em` or responsive units for scalable typography.
- Use minimum touch target sizes of about 44×44px for buttons on mobile.
- Avoid layout shifts while the board loads or updates.

### 3×3 Grid Styling
- Visually distinguish 3×3 sub-grids with alternating background shades or stronger borders.
- Keep the grid easy to scan and readable.
- Prefilled cells should look different from editable cells.

### Dark Mode Support
- Implement a light/dark theme toggle.
- Persist the user theme preference in `localStorage`.
- Ensure text and interactive controls maintain at least WCAG AA contrast.

### Keyboard & Accessibility
- Use semantic HTML and accessible ARIA roles as needed.
- All interactive UI elements must be keyboard accessible.
- Implement arrow-key navigation between cells and Enter to confirm input when appropriate.
- Provide visible focus indicators.
- For screen readers, label cells with row/column context and state, such as "Row 1, Column 2, empty" or "Row 1, Column 2, prefilled 5".
- Provide announcements or status text for errors, hints, and completion.
- Do not rely on color alone; use text or icons for invalid state and completion feedback.

## Core Sudoku Logic

### Puzzle Generation
- Generate puzzles with exactly one valid solution.
- Create a fully solved 9×9 board first, then remove cells while preserving uniqueness.
- Use backtracking and/or constraint propagation for both generation and uniqueness checking.
- Keep generation randomized so repeated plays are not the same.
- Control difficulty by the number of filled cells:
  - Easy: 40-45 prefilled cells
  - Medium: 30-35 prefilled cells
  - Hard: 25-28 prefilled cells
- Prefilled cells must be immutable in the UI.

### Unique Solution Checking
- When removing a cell, verify that the board still has only one solution.
- Implement a solver that counts up to 2 possible completions and stops early once multiple solutions are found.
- Reject removals that cause a second valid solution.
- Maintain the solution only on the server side.

### Validation and Feedback
- Validate the board in real time as the user enters numbers:
  - row constraint
  - column constraint
  - 3×3 sub-grid constraint
- Highlight conflicting cells with a clear visual style.
- If a user submits the board, return detailed validation results rather than just success/failure.
- Detect completion when all cells are filled and valid.
- Show a success modal or message with completion statistics.

## Interactive Features

### Core Game Interactions
- Implement a working Hint feature:
  - reveal one correct number in an empty cell
  - mark the hinted cell as locked/prefilled
  - count hints separately for scoring
- Implement a Check button that validates the current board against the solution and reports incorrect cells.
- Provide user-friendly feedback for each action.
- Ensure the board remains playable while validation is happening.

### Timer
- Start timing when a new puzzle loads or when the first cell is edited.
- Display elapsed time in MM:SS.
- Stop the timer on puzzle completion.
- Optionally pause the timer when the user navigates away or switches tabs.

## Advanced Features

### Number Tracking Visualization
- Display the usage count of each digit (1-9) on the board.
- Show which numbers are complete and how many remain.
- Allow users to tap/click a number to highlight all board instances.
- Use text/icons so the feature remains accessible.

### Note Mode
- Provide a toggle or shortcut to enter note mode.
- In note mode, typed digits should add pencil marks to the selected cell.
- Allow multiple candidate notes in one cell.
- Clear notes when the user enters a final number.
- Display notes in smaller or superscript text.
- Indicate note mode visibly in the UI.

## Testing and Quality
- Add unit tests for Sudoku generation and validation in `tests/`.
- Test that generated boards are valid and puzzles follow Sudoku rules.
- Test that uniqueness checking rejects ambiguous boards.
- Add tests for Flask route behavior and JSON API responses.
- Keep tests deterministic and easy to run.
- Use descriptive test case names and document expected behavior.

## Error Handling Practices
- Validate all inputs before use.
- Ensure the backend returns clear JSON errors for invalid requests.
- Handle network failures gracefully on the frontend.
- Display friendly error messages in the UI.
- Avoid showing raw exception details to the user.
- Use consistent message styling for success, warning, and error states.

## Future Features and Improvements
- Add difficulty selection to the UI and persist the selected difficulty.
- Add a local leaderboard stored in `localStorage`.
- Add a theme toggle and save preference persistently.
- Add puzzle stats like best time, shortest completion, and hint usage.
- Add an undo/redo feature for cell entry.
- Add keyboard shortcuts for note mode, check, hint, and new game.

## Copilot Suggestion Guidance
- Keep changes aligned with the existing Flask + vanilla JS architecture.
- Avoid introducing heavy frontend frameworks or unnecessary dependencies.
- Prefer simple, maintainable solutions.
- Suggest backend improvements in `starter/app.py` and `starter/sudoku_logic.py`.
- Suggest frontend improvements in `starter/static/main.js`, `starter/static/styles.css`, and `starter/templates/index.html`.
- Focus on accessibility, responsive behavior, and game correctness.
