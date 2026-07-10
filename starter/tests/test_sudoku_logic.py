import unittest

import sudoku_logic


class SudokuLogicTests(unittest.TestCase):
    def test_generate_puzzle_has_a_unique_solution(self):
        for clues in (26, 32, 35, 40):
            with self.subTest(clues=clues):
                puzzle, _ = sudoku_logic.generate_puzzle(clues)
                self.assertTrue(sudoku_logic._has_unique_solution(puzzle))


if __name__ == "__main__":
    unittest.main()
