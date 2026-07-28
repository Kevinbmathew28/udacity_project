from board import EMPTY, SIZE, create_empty_board, deep_copy
from solver import fill_board


def remove_cells(board, clues):
    import random

    attempts = SIZE * SIZE - clues
    while attempts > 0:
        row = random.randrange(SIZE)
        col = random.randrange(SIZE)
        if board[row][col] != EMPTY:
            board[row][col] = EMPTY
            attempts -= 1


def generate_puzzle(clues=35):
    board = create_empty_board()
    fill_board(board)
    solution = deep_copy(board)
    remove_cells(board, clues)
    puzzle = deep_copy(board)
    return puzzle, solution
