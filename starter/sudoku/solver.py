from copy import deepcopy

Board = list[list[int]]

def find_empty_cell(board):
    for row in range(9):
        for col in range(9):
            if board[row][col] == 0:
                return row, col
    return None

def is_safe(board, row, col, number):
    # Check row
    if number in board[row]:
        return False
    # Check column
    for r in range(9):
        if board[r][col] == number:
            return False

    # Check 3x3 box
    start_row = (row // 3) * 3
    start_col = (col // 3) * 3

    for r in range(start_row, start_row + 3):
        for c in range(start_col, start_col + 3):
            if board[r][c] == number:
                return False

    return True

def solve_board(board):
    empty = find_empty_cell(board)

    if empty is None:
        return True

    row, col = empty

    for num in range(1, 10):
        if is_safe(board, row, col, num):
            board[row][col] = num

            if solve_board(board):
                return True

            board[row][col] = 0

    return False

def count_solutions(board, limit=2):
    board_copy = deepcopy(board)
    count = 0

    def backtrack():
        nonlocal count

        if count >= limit:
            return

        empty = find_empty_cell(board_copy)

        if empty is None:
            count += 1
            return

        row, col = empty

        for num in range(1, 10):
            if is_safe(board_copy, row, col, num):
                board_copy[row][col] = num
                backtrack()
                board_copy[row][col] = 0

    backtrack()
    return count

def has_unique_solution(board):
    return count_solutions(board) == 1