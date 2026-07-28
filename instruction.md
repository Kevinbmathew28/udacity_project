# GitHub Copilot Instructions

## Project Goal

Refactor the Flask Sudoku application into a clean, modular, and maintainable project while preserving existing functionality.

## Python Guidelines

- Follow PEP 8.
- Use descriptive variable and function names.
- Keep functions small and reusable.
- Avoid duplicate code.
- Add type hints where appropriate.

## Flask Guidelines

- Keep routes thin.
- Move business logic outside app.py.
- Separate UI from game logic.

## Testing

- Run pytest after every major change.
- Preserve all existing functionality.
- Do not introduce breaking changes.

## Refactoring

- Perform small incremental refactoring.
- Preserve backward compatibility.
- Keep public function names unchanged.
