import importlib.util
import os
from pathlib import Path
import pytest

REPO_ROOT = Path(__file__).resolve().parents[1]
SOLUTION_PATH = REPO_ROOT / "Projects" / "1_Sudoku" / "solution.py"


def _load_module_from_path(path, name="sudoku_solution"):
    spec = importlib.util.spec_from_file_location(name, str(path))
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def test_sudoku_solver_returns_valid_board():
    """Load the Sudoku solution module and assert the solver returns a valid board.

    The test will be skipped if the expected solution.py file is not present.
    """
    if not SOLUTION_PATH.exists():
        pytest.skip(f"No solution.py found at {SOLUTION_PATH} - skipping Sudoku generator test")

    mod = _load_module_from_path(SOLUTION_PATH)
    if not hasattr(mod, "solve"):
        pytest.skip("No solve(grid) function found in solution.py - skipping")

    # Example diagonal grid used by the project tests
    diagonal_grid = '2.............62....1....7...6..8...3...9...7...6..4...4....8....52.............3'
    result = mod.solve(diagonal_grid)

    assert isinstance(result, dict), "solve() should return a dict mapping box names to digits"
    assert len(result) == 81, "There should be 81 boxes in the solved board"

    # Basic cell value checks
    digits = set("123456789")
    for v in result.values():
        assert isinstance(v, str) and v in digits and len(v) == 1

    # Check row, column, and 3x3 block uniqueness
    rows = "ABCDEFGHI"
    cols = "123456789"

    # rows
    for r in rows:
        vals = [result[r + c] for c in cols]
        assert set(vals) == digits

    # columns
    for c in cols:
        vals = [result[r + c] for r in rows]
        assert set(vals) == digits

    # 3x3 blocks
    row_blocks = ("ABC", "DEF", "GHI")
    col_blocks = ("123", "456", "789")
    for rb in row_blocks:
        for cb in col_blocks:
            vals = [result[r + c] for r in rb for c in cb]
            assert set(vals) == digits
