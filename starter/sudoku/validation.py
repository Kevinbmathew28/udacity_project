from sudoku.solver import Board


def is_valid_move(board: Board, row: int, col: int, value: int) -> bool:
    if value < 1 or value > 9:
        return False

    for c in range(9):
        if c != col and board[row][c] == value:
            return False

    for r in range(9):
        if r != row and board[r][col] == value:
            return False

    start_row = row - row % 3
    start_col = col - col % 3

    for r in range(start_row, start_row + 3):
        for c in range(start_col, start_col + 3):
            if (r, c) != (row, col) and board[r][c] == value:
                return False

    return True