import sudoku_logic as s
board = [[8,6,4,5,2,9,7,3,1],[3,5,1,7,4,8,9,2,6],[9,7,2,6,3,1,8,4,5],[4,1,3,8,9,7,5,6,2],[6,9,8,4,5,2,1,7,3],[5,2,7,1,6,3,4,9,8],[7,8,6,2,1,4,3,5,9],[2,4,9,3,8,5,6,1,7],[1,3,5,9,7,6,2,8,4]]
board[0][0] = 0
print('safe 8', s.is_safe(board, 0, 0, 8))
print('safe 7', s.is_safe(board, 0, 0, 7))
print('empties', [(r, c) for r in range(9) for c in range(9) if board[r][c] == 0])
print('solutions', s.count_solutions(board, limit=2))
