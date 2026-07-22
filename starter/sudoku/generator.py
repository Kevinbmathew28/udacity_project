import random
from copy import deepcopy

from sudoku.solver import Board, has_unique_solution, solve_board


DIFFICULTY_PREFILLED_CELLS = {
    "easy": 40,
    "medium": 32,
    "hard": 26,
}


def create_complete_board() -> Board:
    board: Board = [[0 for _ in range(9)] for _ in range(9)]
    fill_board(board)
    return board


def fill_board(board: Board) -> bool:
    empty_cells = [
        (row, col)
        for row in range(9)
        for col in range(9)
        if board[row][col] == 0
    ]

    if not empty_cells:
        return True

    row, col = random.choice(empty_cells)
    numbers = list(range(1, 10))
    random.shuffle(numbers)

    from sudoku.solver import is_safe

    for number in numbers:
        if is_safe(board, row, col, number):
            board[row][col] = number

            if fill_board(board):
                return True

            board[row][col] = 0

    return False


def generate_puzzle(difficulty: str = "easy") -> tuple[Board, Board]:
    difficulty = difficulty.lower()

    prefilled_cells = DIFFICULTY_PREFILLED_CELLS.get(difficulty, 40)

    solution = create_complete_board()
    puzzle = deepcopy(solution)

    cells_to_remove = 81 - prefilled_cells
    positions = [(row, col) for row in range(9) for col in range(9)]
    random.shuffle(positions)

    removed = 0

    for row, col in positions:
        if removed >= cells_to_remove:
            break

        backup = puzzle[row][col]
        puzzle[row][col] = 0

        if has_unique_solution(puzzle):
            removed += 1
        else:
            puzzle[row][col] = backup

    return puzzle, solution