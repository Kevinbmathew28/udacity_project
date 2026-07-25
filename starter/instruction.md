# GitHub Copilot Instructions

## Project
Refactor a legacy Python Flask Sudoku application into a modern, maintainable web application.

## Coding Standards

- Use Python best practices (PEP 8).
- Write modular and reusable functions.
- Keep functions small and focused.
- Add comments where logic is complex.
- Handle errors gracefully.
- Do not duplicate code.
- Prefer readability over clever code.

## Sudoku Requirements

- Generate puzzles with exactly one unique solution.
- Support Easy, Medium and Hard difficulty levels.
- Lock all prefilled cells.
- Validate user moves.
- Provide Hint and Check features.
- Display a completion message.
- Maintain a Top 10 leaderboard using browser local storage.
- Support dark mode.
- Display a timer.

## Frontend

- Use responsive design.
- Alternate colours for each 3×3 Sudoku block.
- Keep the UI usable in both light and dark themes.

## Testing

- Use pytest.
- Ensure existing functionality continues to work after refactoring.

## Copilot Guidance

When suggesting code:

- Explain complex logic.
- Prefer modular implementations.
- Avoid unnecessary libraries.
- Keep Flask routes simple.
- Write maintainable code.