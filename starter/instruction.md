# GitHub Copilot Instructions

## Project Overview
This project is a Flask-based Sudoku game refactored using GitHub Copilot.

## Coding Style
- Use modern Python and Flask best practices.
- Keep functions small and reusable.
- Follow consistent naming conventions.
- Add comments for important logic.
- Avoid duplicate code.

## Project Structure
- Keep game logic in `sudoku_logic.py`.
- Keep Flask routes in `app.py`.
- Keep HTML templates inside `templates/`.
- Keep CSS and JavaScript inside `static/`.
- Store tests inside the `tests/` folder.

## Testing
- Write or update pytest tests for new functionality.
- Ensure all tests pass before submitting changes.

## UI Guidelines
- Keep the interface responsive.
- Support both light and dark mode.
- Maintain consistent styling across components.

## Error Handling
- Return meaningful error messages.
- Handle invalid user input gracefully.

## Copilot Guidance
When suggesting code:
- Reuse existing project patterns.
- Preserve existing functionality.
- Explain major code changes before applying them.
- Prefer clean, readable, and maintainable code.

## Refactor Legacy Code to Modern Standards

### Modular Design
- Break code into reusable, single-responsibility components.
- Separate Sudoku game logic, Flask routes, UI rendering, validation, and leaderboard logic.
- Reuse helper functions instead of duplicating code.
- Keep functions small, focused, and easy to test.

### Documentation
- Add comments for complex algorithms such as Sudoku generation, unique solution checking, hint generation, and puzzle validation.
- Use meaningful variable and function names.
- Keep formatting and naming consistent throughout the project.

### Error Handling
- Validate all user inputs before processing.
- Return meaningful JSON error messages from Flask routes.
- Handle missing game state or invalid requests gracefully.
- Avoid crashes by checking for invalid or empty values.