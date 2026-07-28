import sudoku_logic


def test_generate_puzzle_returns_valid_board():
    puzzle, solution = sudoku_logic.generate_puzzle(difficulty="medium")

    assert len(puzzle) == sudoku_logic.SIZE
    assert len(solution) == sudoku_logic.SIZE
    assert all(len(row) == sudoku_logic.SIZE for row in puzzle)
    assert all(len(row) == sudoku_logic.SIZE for row in solution)

    for row in puzzle:
        for cell in row:
            assert cell in range(0, sudoku_logic.SIZE + 1)

    for row in solution:
        for cell in row:
            assert cell in range(1, sudoku_logic.SIZE + 1)


def test_generate_puzzle_supports_difficulty_levels():
    for difficulty, expected_clues in [("easy", 45), ("medium", 35), ("hard", 25)]:
        puzzle, _ = sudoku_logic.generate_puzzle(difficulty=difficulty)
        clue_count = sum(cell != sudoku_logic.EMPTY for row in puzzle for cell in row)
        assert clue_count == expected_clues


def test_generate_puzzle_has_unique_solution():
    for difficulty in ["easy", "medium", "hard"]:
        puzzle, _ = sudoku_logic.generate_puzzle(difficulty=difficulty)
        assert sudoku_logic.count_solutions(puzzle, limit=2) == 1


def test_create_empty_board_has_expected_shape():
    board = sudoku_logic.create_empty_board()

    assert board == [[0] * sudoku_logic.SIZE for _ in range(sudoku_logic.SIZE)]
    assert len(board) == sudoku_logic.SIZE
