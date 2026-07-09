# Sudoku Game

A simple and polished Flask-based Sudoku game with a responsive interface, difficulty selection, hint support, solution checking, a timer, dark mode, and a leaderboard.

## Features

- Difficulty selector
- Hint button
- Check solution
- Live validation
- Timer
- Dark mode
- Top 10 leaderboard
- Unique solution generation

## Technologies

- Python
- Flask
- HTML
- CSS
- JavaScript
- GitHub Copilot

## Installation

```bash
python -m venv .venv
```

Activate the virtual environment.

Install dependencies:

```bash
pip install -r requirements.txt
```

## Run

```bash
python app.py
```

Open:

```text
http://127.0.0.1:5000
```

## Run Tests

```bash
pytest
```

## Project Structure

- app.py: Main Flask application and routes
- sudoku_logic.py: Sudoku generation and validation logic
- templates/: HTML templates for the web interface
- static/: CSS and JavaScript assets
- tests/: Automated pytest test suite

## Author

Your Name
