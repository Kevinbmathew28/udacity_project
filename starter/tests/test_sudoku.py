from app.sudoku import (
    board_is_complete_and_correct,
    generate_puzzle,
    has_unique_solution,
)


def test_generate_easy_puzzle_has_unique_solution():
    puzzle, solution = generate_puzzle("easy")

    assert len(puzzle) == 9
    assert len(solution) == 9
    assert has_unique_solution(puzzle)


def test_generated_solution_is_complete_and_correct():
    _, solution = generate_puzzle("easy")

    assert board_is_complete_and_correct(solution, solution)


def test_difficulty_changes_prefilled_cells():
    easy_puzzle, _ = generate_puzzle("easy")
    hard_puzzle, _ = generate_puzzle("hard")

    easy_prefilled = sum(1 for row in easy_puzzle for value in row if value != 0)
    hard_prefilled = sum(1 for row in hard_puzzle for value in row if value != 0)

    assert easy_prefilled > hard_prefilled