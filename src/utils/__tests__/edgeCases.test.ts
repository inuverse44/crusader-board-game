import { gameReducer, createInitialGameState } from '../gameReducer';
import { 
  isValidPosition, 
  positionsEqual, 
  calculatePossibleMoves, 
  calculatePossibleAttacks,
  isValidMove,
  isValidAttack
} from '../movementUtils';
import { GameState, GameAction, GamePiece } from '../../types';

describe('Edge Cases and Error Handling', () => {
  let initialState: GameState;

  beforeEach(() => {
    initialState = createInitialGameState();
  });

  describe('Board boundary edge cases', () => {
    it('should handle corner positions correctly for movement', () => {
      const customState = createInitialGameState();
      
      // Clear the top row first
      for (let col = 0; col < 8; col++) {
        customState.board[0][col] = null;
      }
      
      // Place a heavy piece in top-left corner
      customState.board[0][0] = {
        id: 'heavy-corner',
        type: 'heavy',
        player: 'player1',
        position: { row: 0, col: 0 }
      };
      
      const cornerPiece = customState.board[0][0]!;
      const moves = calculatePossibleMoves(customState.board, cornerPiece);
      
      // Should only have 3 possible moves from corner
      expect(moves).toHaveLength(3);
      expect(moves).toContainEqual({ row: 0, col: 1 }); // Right
      expect(moves).toContainEqual({ row: 1, col: 0 }); // Down
      expect(moves).toContainEqual({ row: 1, col: 1 }); // Down-right
    });

    it('should handle edge positions correctly for attacks', () => {
      const customState = createInitialGameState();
      
      // Place heavy piece at edge
      customState.board[0][4] = {
        id: 'heavy-edge',
        type: 'heavy',
        player: 'player1',
        position: { row: 0, col: 4 }
      };
      
      // Place light pieces around it
      customState.board[1][3] = {
        id: 'light-1',
        type: 'light',
        player: 'player2',
        position: { row: 1, col: 3 }
      };
      
      customState.board[1][4] = {
        id: 'light-2',
        type: 'light',
        player: 'player2',
        position: { row: 1, col: 4 }
      };
      
      const edgePiece = customState.board[0][4]!;
      const attacks = calculatePossibleAttacks(customState.board, edgePiece);
      
      expect(attacks).toContainEqual({ row: 1, col: 3 });
      expect(attacks).toContainEqual({ row: 1, col: 4 });
    });

    it('should validate positions correctly at boundaries', () => {
      expect(isValidPosition({ row: -1, col: 0 })).toBe(false);
      expect(isValidPosition({ row: 0, col: -1 })).toBe(false);
      expect(isValidPosition({ row: 8, col: 0 })).toBe(false);
      expect(isValidPosition({ row: 0, col: 8 })).toBe(false);
      expect(isValidPosition({ row: 0, col: 0 })).toBe(true);
      expect(isValidPosition({ row: 7, col: 7 })).toBe(true);
    });
  });

  describe('Invalid action handling', () => {
    it('should ignore invalid move attempts', () => {
      const piece = initialState.board[7][0]!;
      let state = gameReducer(initialState, { type: 'SELECT_PIECE', piece });
      
      // Try to move to an invalid position (too far)
      const invalidMoveAction: GameAction = {
        type: 'MOVE_PIECE',
        from: { row: 7, col: 0 },
        to: { row: 5, col: 0 } // 2 squares away
      };
      
      const newState = gameReducer(state, invalidMoveAction);
      
      expect(newState).toBe(state); // State should not change
      expect(newState.board[7][0]).toBe(piece); // Piece should still be there
      expect(newState.board[5][0]).toBeNull(); // Target should still be empty
    });

    it('should ignore invalid attack attempts', () => {
      const piece = initialState.board[7][0]!;
      let state = gameReducer(initialState, { type: 'SELECT_PIECE', piece });
      
      // Try to attack a position with no enemy piece
      const invalidAttackAction: GameAction = {
        type: 'ATTACK_PIECE',
        attacker: { row: 7, col: 0 },
        target: { row: 6, col: 0 } // Empty position
      };
      
      const newState = gameReducer(state, invalidAttackAction);
      
      expect(newState).toBe(state); // State should not change
    });

    it('should ignore actions when no piece is selected', () => {
      const moveAction: GameAction = {
        type: 'MOVE_PIECE',
        from: { row: 7, col: 0 },
        to: { row: 6, col: 0 }
      };
      
      const attackAction: GameAction = {
        type: 'ATTACK_PIECE',
        attacker: { row: 7, col: 0 },
        target: { row: 0, col: 0 }
      };
      
      expect(gameReducer(initialState, moveAction)).toBe(initialState);
      expect(gameReducer(initialState, attackAction)).toBe(initialState);
    });

    it('should handle selection of pieces not on board', () => {
      // Create an empty board area
      const customState = createInitialGameState();
      
      // Clear the center area
      for (let row = 3; row <= 5; row++) {
        for (let col = 3; col <= 5; col++) {
          customState.board[row][col] = null;
        }
      }
      
      const nonExistentPiece: GamePiece = {
        id: 'fake-piece',
        type: 'heavy',
        player: 'player1',
        position: { row: 4, col: 4 }
      };
      
      const selectAction: GameAction = {
        type: 'SELECT_PIECE',
        piece: nonExistentPiece
      };
      
      const newState = gameReducer(customState, selectAction);
      
      // Should select the piece and calculate moves for the empty area
      expect(newState.selectedPiece).toBe(nonExistentPiece);
      // Since the piece position is in an empty area, it should have moves
      expect(newState.possibleMoves.length).toBeGreaterThan(0);
    });
  });

  describe('Position equality and validation', () => {
    it('should correctly compare positions', () => {
      expect(positionsEqual({ row: 3, col: 4 }, { row: 3, col: 4 })).toBe(true);
      expect(positionsEqual({ row: 3, col: 4 }, { row: 3, col: 5 })).toBe(false);
      expect(positionsEqual({ row: 3, col: 4 }, { row: 4, col: 4 })).toBe(false);
      expect(positionsEqual({ row: 0, col: 0 }, { row: 0, col: 0 })).toBe(true);
    });

    it('should validate moves correctly', () => {
      const piece = initialState.board[7][0]!;
      
      expect(isValidMove(initialState.board, piece, { row: 6, col: 0 })).toBe(true);
      expect(isValidMove(initialState.board, piece, { row: 6, col: 1 })).toBe(true);
      expect(isValidMove(initialState.board, piece, { row: 5, col: 0 })).toBe(false); // Too far
      expect(isValidMove(initialState.board, piece, { row: 7, col: 1 })).toBe(false); // Occupied
    });

    it('should validate attacks correctly', () => {
      const customState = createInitialGameState();
      
      // Place pieces for attack scenario
      customState.board[4][4] = {
        id: 'heavy-attacker',
        type: 'heavy',
        player: 'player1',
        position: { row: 4, col: 4 }
      };
      
      customState.board[3][4] = {
        id: 'light-target',
        type: 'light',
        player: 'player2',
        position: { row: 3, col: 4 }
      };
      
      // Place another light piece for forward attack
      customState.board[2][4] = {
        id: 'light-target2',
        type: 'light',
        player: 'player2',
        position: { row: 2, col: 4 }
      };
      
      const attacker = customState.board[4][4]!;
      
      expect(isValidAttack(customState.board, attacker, { row: 3, col: 4 })).toBe(true);
      expect(isValidAttack(customState.board, attacker, { row: 2, col: 4 })).toBe(true); // Forward 2
      expect(isValidAttack(customState.board, attacker, { row: 1, col: 4 })).toBe(false); // Too far forward
      expect(isValidAttack(customState.board, attacker, { row: 4, col: 6 })).toBe(false); // No target
    });
  });

  describe('State consistency', () => {
    it('should maintain board consistency after moves', () => {
      const piece = initialState.board[7][0]!;
      let state = gameReducer(initialState, { type: 'SELECT_PIECE', piece });
      
      const moveAction: GameAction = {
        type: 'MOVE_PIECE',
        from: { row: 7, col: 0 },
        to: { row: 6, col: 0 }
      };
      
      const newState = gameReducer(state, moveAction);
      
      // Check that piece moved correctly
      expect(newState.board[7][0]).toBeNull();
      expect(newState.board[6][0]).not.toBeNull();
      expect(newState.board[6][0]!.position).toEqual({ row: 6, col: 0 });
      expect(newState.board[6][0]!.id).toBe(piece.id);
    });

    it('should maintain board consistency after attacks', () => {
      const customState = createInitialGameState();
      
      // Set up attack scenario
      customState.board[5][0] = {
        id: 'light-target',
        type: 'light',
        player: 'player2',
        position: { row: 5, col: 0 }
      };
      
      customState.currentPlayer = 'player1';
      
      const attacker = customState.board[7][0]!;
      let state = gameReducer(customState, { type: 'SELECT_PIECE', piece: attacker });
      
      const attackAction: GameAction = {
        type: 'ATTACK_PIECE',
        attacker: { row: 7, col: 0 },
        target: { row: 5, col: 0 }
      };
      
      const newState = gameReducer(state, attackAction);
      
      // Check that target was removed
      expect(newState.board[5][0]).toBeNull();
      // Check that attacker is still there
      expect(newState.board[7][0]).not.toBeNull();
    });

    it('should clear selection state after actions', () => {
      const piece = initialState.board[7][0]!;
      let state = gameReducer(initialState, { type: 'SELECT_PIECE', piece });
      
      expect(state.selectedPiece).toBe(piece);
      expect(state.possibleMoves.length).toBeGreaterThan(0);
      
      const moveAction: GameAction = {
        type: 'MOVE_PIECE',
        from: { row: 7, col: 0 },
        to: { row: 6, col: 0 }
      };
      
      const newState = gameReducer(state, moveAction);
      
      expect(newState.selectedPiece).toBeNull();
      expect(newState.possibleMoves).toEqual([]);
      expect(newState.possibleAttacks).toEqual([]);
    });
  });

  describe('Turn management edge cases', () => {
    it('should handle END_TURN correctly for different players', () => {
      // Test END_TURN for player1 (should not change)
      const endTurnState = gameReducer(initialState, { type: 'END_TURN' });
      expect(endTurnState).toBe(initialState);
      
      // Test END_TURN for player2
      const player2State = { ...initialState, currentPlayer: 'player2' as const };
      const endTurnPlayer2 = gameReducer(player2State, { type: 'END_TURN' });
      expect(endTurnPlayer2.currentPlayer).toBe('player1');
    });

    it('should reset light pieces counter on turn switch', () => {
      const stateWithMoves = {
        ...initialState,
        currentPlayer: 'player2' as const,
        lightPiecesMovedThisTurn: 1
      };
      
      const newState = gameReducer(stateWithMoves, { type: 'END_TURN' });
      
      expect(newState.lightPiecesMovedThisTurn).toBe(0);
      expect(newState.currentPlayer).toBe('player1');
    });
  });
});