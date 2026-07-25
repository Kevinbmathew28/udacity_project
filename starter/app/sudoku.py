import random
from copy import deepcopy

GRID_SIZE = 9
BOX_SIZE = 3


def solved_pattern(row: int, col: int) -> int:
    return (BOX_SIZE * (row % BOX_SIZE) + row // BOX_SIZE + col) % GRID_SIZE


def shuffled(items):
    values = list(items)
    random.shuffle(values)
    return values


def generate_full_solution() -> list[list[int]]:
    row_groups = shuffled(range(BOX_SIZE))
    rows = [
        group * BOX_SIZE + row
        for group in row_groups
        for row in shuffled(range(BOX_SIZE))
    ]

    col_groups = shuffled(range(BOX_SIZE))
    cols = [
        group * BOX_SIZE + col
        for group in col_groups
        for col in shuffled(range(BOX_SIZE))
    ]

    nums = shuffled(range(1, GRID_SIZE + 1))

    return [
        [nums[solved_pattern(row, col)] for col in cols]
        for row in rows
    ]


def is_valid_move(board: list[list[int]], row: int, col: int, num: int) -> bool:
    if num < 1 or num > 9:
        return False

    for index in range(GRID_SIZE):
        if board[row][index] == num and index != col:
            return False
        if board[index][col] == num and index != row:
            return False

    start_row = row - row % BOX_SIZE
    start_col = col - col % BOX_SIZE

    for r in range(start_row, start_row + BOX_SIZE):
        for c in range(start_col, start_col + BOX_SIZE):
            if board[r][c] == num and (r, c) != (row, col):
                return False

    return True


def find_empty_cell(board: list[list[int]]) -> tuple[int, int] | None:
    for row in range(GRID_SIZE):
        for col in range(GRID_SIZE):
            if board[row][col] == 0:
                return row, col
    return None


def count_solutions(board: list[list[int]], limit: int = 2) -> int:
    empty = find_empty_cell(board)

    if empty is None:
        return 1

    row, col = empty
    total = 0

    for num in range(1, 10):
        if is_valid_move(board, row, col, num):
            board[row][col] = num
            total += count_solutions(board, limit)
            board[row][col] = 0

            if total >= limit:
                return total

    return total


def has_unique_solution(board: list[list[int]]) -> bool:
    board_copy = deepcopy(board)
    return count_solutions(board_copy, limit=2) == 1


def difficulty_to_blanks(difficulty: str) -> int:
    difficulty_map = {
        "easy": 35,
        "medium": 45,
        "hard": 52,
    }
    return difficulty_map.get(difficulty.lower(), 35)


def generate_puzzle(difficulty: str = "easy") -> tuple[list[list[int]], list[list[int]]]:
    solution = generate_full_solution()
    puzzle = deepcopy(solution)
    blanks_needed = difficulty_to_blanks(difficulty)

    cells = [(row, col) for row in range(GRID_SIZE) for col in range(GRID_SIZE)]
    random.shuffle(cells)

    blanks_created = 0

    for row, col in cells:
        if blanks_created >= blanks_needed:
            break

        old_value = puzzle[row][col]
        puzzle[row][col] = 0

        if has_unique_solution(puzzle):
            blanks_created += 1
        else:
            puzzle[row][col] = old_value

    return puzzle, solution


def board_is_complete_and_correct(
    board: list[list[int]],
    solution: list[list[int]]
) -> bool:
    return board == solution


def find_incorrect_cells(
    board: list[list[int]],
    solution: list[list[int]]
) -> list[dict[str, int]]:
    errors = []

    for row in range(GRID_SIZE):
        for col in range(GRID_SIZE):
            if board[row][col] != 0 and board[row][col] != solution[row]errors.append({"row": row, "col": col})

    return errors


def get_next_hint(
    board: list[list[int]],
    solution: list[list[int]]
) -> dict[str, int] | None:
    for row in range(GRID_SIZE):
        for col in range(GRID_SIZE):
            if board[row][col] == 0 or board[row][col] != solution[row]return {
                    "row": row,
                    "col": col,
                    "value": solution[row][col],
                }

    return None