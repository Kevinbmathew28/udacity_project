import sudoku_logic


def test_create_empty_board():
    board = sudoku_logic.create_empty_board()
    assert len(board) == sudoku_logic.SIZE
    assert all(len(row) == sudoku_logic.SIZE for row in board)
    assert all(cell == sudoku_logic.EMPTY for row in board for cell in row)


def test_deep_copy_independent():
    board = sudoku_logic.create_empty_board()
    copy_board = sudoku_logic.deep_copy(board)
    copy_board[0][0] = 1
    assert board[0][0] == sudoku_logic.EMPTY
    assert copy_board[0][0] == 1


def test_is_safe_for_empty_board():
    board = sudoku_logic.create_empty_board()
    assert sudoku_logic.is_safe(board, 0, 0, 1)
    board[0][1] = 1
    assert not sudoku_logic.is_safe(board, 0, 0, 1)


def test_generate_puzzle_returns_puzzle_and_solution():
    puzzle, solution = sudoku_logic.generate_puzzle(clues=35)
    assert len(puzzle) == sudoku_logic.SIZE
    assert len(solution) == sudoku_logic.SIZE
    assert puzzle != solution
    assert sum(1 for row in puzzle for cell in row if cell == sudoku_logic.EMPTY) == 81 - 35
