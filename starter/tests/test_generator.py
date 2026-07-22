from sudoku.generator import generate_puzzle
from sudoku.solver import has_unique_solution


def count_prefilled_cells(board):
    return sum(1 for row in board for value in row if value != 0)


def test_easy_puzzle_has_unique_solution():
    puzzle, solution = generate_puzzle("easy")

    assert len(puzzle) == 9
    assert len(solution) == 9
    assert has_unique_solution(puzzle) is True


def test_difficulty_changes_prefilled_cells():
    easy_puzzle, _ = generate_puzzle("easy")
    hard_puzzle, _ = generate_puzzle("hard")

    assert count_prefilled_cells(easy_puzzle) > count_prefilled_cells(hard_puzzle)