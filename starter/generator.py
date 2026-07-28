from board import EMPTY, SIZE, create_empty_board, deep_copy
from solver import fill_board
from validator import is_safe


def remove_cells(board, clues):
    import random

    attempts = SIZE * SIZE - clues
    while attempts > 0:
        row = random.randrange(SIZE)
        col = random.randrange(SIZE)
        if board[row][col] != EMPTY:
            board[row][col] = EMPTY
            attempts -= 1


def count_solutions(board, limit=2):
    board_copy = deep_copy(board)
    solutions = 0

    def search(state):
        nonlocal solutions

        if solutions >= limit:
            return

        next_empty = None
        for row in range(SIZE):
            for col in range(SIZE):
                if state[row][col] == EMPTY:
                    next_empty = (row, col)
                    break
            if next_empty is not None:
                break

        if next_empty is None:
            solutions += 1
            return

        row, col = next_empty
        for candidate in range(1, SIZE + 1):
            if not is_safe(state, row, col, candidate):
                continue
            state[row][col] = candidate
            search(state)
            if solutions >= limit:
                state[row][col] = EMPTY
                return
            state[row][col] = EMPTY

    search(board_copy)
    return solutions


def generate_puzzle(clues=35):
    while True:
        board = create_empty_board()
        fill_board(board)
        solution = deep_copy(board)
        remove_cells(board, clues)
        puzzle = deep_copy(board)
        if count_solutions(puzzle, limit=2) == 1:
            return puzzle, solution
