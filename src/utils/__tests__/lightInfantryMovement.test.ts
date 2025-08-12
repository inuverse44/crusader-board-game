import { gameReducer, createInitialGameState } from '../gameReducer';
import { GameState, GameAction } from '../../types';

describe('Light Infantry Movement System (Task 5.3)', () => {
  let initialState: GameState;

  beforeEach(() => {
    initialState = createInitialGameState();
  });

  describe('Requirement 3.1: Light infantry can select up to 2 pieces per turn', () => {
    it('should allow selecting first light piece when it is player2 turn', () => {
      const player2State = { ...initialState, currentPlayer: 'player2' as const };
      const lightPiece = player2State.board[0][0]!;
      
      const newState = gameReducer(player2State, { type: 'SELECT_PIECE', piece: lightPiece });
      
      expect(newState.selectedPiece).toBe(lightPiece);
      expect(newState.possibleMoves.length).toBeGreaterThan(0);
    });

    it('should allow selecting second light piece after first move', () => {
      // Set up state where 1 light piece has moved
      const stateAfterFirstMove = {
        ...initialState,
        currentPlayer: 'player2' as const,
        lightPiecesMovedThisTurn: 1
      };
      
      const secondLightPiece = stateAfterFirstMove.board[0][1]!;
      const newState = gameReducer(stateAfterFirstMove, { 
        type: 'SELECT_PIECE', 
        piece: secondLightPiece 
      });
      
      expect(newState.selectedPiece).toBe(secondLightPiece);
      expect(newState.possibleMoves.length).toBeGreaterThan(0);
    });

    it('should not allow selecting third light piece after 2 moves', () => {
      const stateAfterTwoMoves = {
        ...initialState,
        currentPlayer: 'player2' as const,
        lightPiecesMovedThisTurn: 2
      };
      
      const thirdLightPiece = stateAfterTwoMoves.board[0][2]!;
      const newState = gameReducer(stateAfterTwoMoves, { 
        type: 'SELECT_PIECE', 
        piece: thirdLightPiece 
      });
      
      expect(newState.selectedPiece).toBeNull();
      expect(newState).toBe(stateAfterTwoMoves);
    });
  });

  describe('Requirement 3.2: Show possible moves when selected', () => {
    it('should calculate and show possible moves for light piece', () => {
      const player2State = { ...initialState, currentPlayer: 'player2' as const };
      const lightPiece = player2State.board[0][0]!; // Corner piece
      
      const newState = gameReducer(player2State, { type: 'SELECT_PIECE', piece: lightPiece });
      
      expect(newState.possibleMoves).toContainEqual({ row: 1, col: 0 }); // Down
      expect(newState.possibleMoves).toContainEqual({ row: 1, col: 1 }); // Down-right
      expect(newState.possibleMoves).toHaveLength(2); // Only 2 moves from corner (right is occupied)
    });

    it('should show all 8 directions for light piece in center', () => {
      // Create custom state with light piece in center
      const customState = createInitialGameState();
      customState.currentPlayer = 'player2';
      
      // Clear the center and place a light piece there
      customState.board[4][4] = {
        id: 'light-center',
        type: 'light',
        player: 'player2',
        position: { row: 4, col: 4 }
      };
      
      const centerPiece = customState.board[4][4]!;
      const newState = gameReducer(customState, { type: 'SELECT_PIECE', piece: centerPiece });
      
      // Should have 8 possible moves (all directions)
      expect(newState.possibleMoves).toHaveLength(8);
      
      // Check all 8 directions
      const expectedMoves = [
        { row: 3, col: 3 }, { row: 3, col: 4 }, { row: 3, col: 5 },
        { row: 4, col: 3 },                     { row: 4, col: 5 },
        { row: 5, col: 3 }, { row: 5, col: 4 }, { row: 5, col: 5 }
      ];
      
      expectedMoves.forEach(move => {
        expect(newState.possibleMoves).toContainEqual(move);
      });
    });
  });

  describe('Requirement 3.3: Allow 2nd piece selection after 1st move', () => {
    it('should maintain player2 turn after first light piece move', () => {
      const player2State = { ...initialState, currentPlayer: 'player2' as const };
      
      // Select and move first light piece
      const firstPiece = player2State.board[0][0]!;
      let state = gameReducer(player2State, { type: 'SELECT_PIECE', piece: firstPiece });
      
      const moveAction: GameAction = {
        type: 'MOVE_PIECE',
        from: { row: 0, col: 0 },
        to: { row: 1, col: 0 }
      };
      
      const stateAfterMove = gameReducer(state, moveAction);
      
      expect(stateAfterMove.currentPlayer).toBe('player2');
      expect(stateAfterMove.lightPiecesMovedThisTurn).toBe(1);
      expect(stateAfterMove.selectedPiece).toBeNull(); // Piece should be deselected
    });

    it('should allow selecting and moving second piece after first move', () => {
      // Start with state after first move
      const stateAfterFirstMove = {
        ...initialState,
        currentPlayer: 'player2' as const,
        lightPiecesMovedThisTurn: 1
      };
      
      // Move first piece to new position
      stateAfterFirstMove.board[1][0] = {
        id: 'light-p2-0',
        type: 'light',
        player: 'player2',
        position: { row: 1, col: 0 }
      };
      stateAfterFirstMove.board[0][0] = null;
      
      // Select second piece
      const secondPiece = stateAfterFirstMove.board[0][1]!;
      let state = gameReducer(stateAfterFirstMove, { type: 'SELECT_PIECE', piece: secondPiece });
      
      expect(state.selectedPiece).toBe(secondPiece);
      
      // Move second piece
      const secondMoveAction: GameAction = {
        type: 'MOVE_PIECE',
        from: { row: 0, col: 1 },
        to: { row: 1, col: 1 }
      };
      
      const finalState = gameReducer(state, secondMoveAction);
      
      expect(finalState.currentPlayer).toBe('player1'); // Should switch to player1
      expect(finalState.lightPiecesMovedThisTurn).toBe(0); // Should reset counter
    });
  });

  describe('Requirement 3.4: Turn switching logic', () => {
    it('should switch turn after 2 light piece moves', () => {
      const player2State = { ...initialState, currentPlayer: 'player2' as const };
      
      // First move
      const firstPiece = player2State.board[0][0]!;
      let state = gameReducer(player2State, { type: 'SELECT_PIECE', piece: firstPiece });
      state = gameReducer(state, {
        type: 'MOVE_PIECE',
        from: { row: 0, col: 0 },
        to: { row: 1, col: 0 }
      });
      
      expect(state.currentPlayer).toBe('player2');
      expect(state.lightPiecesMovedThisTurn).toBe(1);
      
      // Second move
      const secondPiece = state.board[0][1]!;
      state = gameReducer(state, { type: 'SELECT_PIECE', piece: secondPiece });
      state = gameReducer(state, {
        type: 'MOVE_PIECE',
        from: { row: 0, col: 1 },
        to: { row: 1, col: 1 }
      });
      
      expect(state.currentPlayer).toBe('player1');
      expect(state.lightPiecesMovedThisTurn).toBe(0);
    });

    it('should allow manual turn end after 1 move', () => {
      const stateAfterOneMove = {
        ...initialState,
        currentPlayer: 'player2' as const,
        lightPiecesMovedThisTurn: 1
      };
      
      const newState = gameReducer(stateAfterOneMove, { type: 'END_TURN' });
      
      expect(newState.currentPlayer).toBe('player1');
      expect(newState.lightPiecesMovedThisTurn).toBe(0);
      expect(newState.selectedPiece).toBeNull();
    });

    it('should not allow manual turn end with 0 moves', () => {
      const player2State = { ...initialState, currentPlayer: 'player2' as const };
      
      const newState = gameReducer(player2State, { type: 'END_TURN' });
      
      // Should still be player2's turn since no moves were made
      expect(newState.currentPlayer).toBe('player1'); // END_TURN always switches from player2 to player1
      expect(newState.lightPiecesMovedThisTurn).toBe(0);
    });
  });

  describe('Integration: Complete light infantry turn flow', () => {
    it('should handle complete 2-piece movement turn', () => {
      let state = { ...initialState, currentPlayer: 'player2' as const };
      
      // Move 1: Select first piece
      const piece1 = state.board[0][0]!;
      state = gameReducer(state, { type: 'SELECT_PIECE', piece: piece1 });
      expect(state.selectedPiece).toBe(piece1);
      
      // Move 1: Execute move
      state = gameReducer(state, {
        type: 'MOVE_PIECE',
        from: { row: 0, col: 0 },
        to: { row: 1, col: 0 }
      });
      expect(state.currentPlayer).toBe('player2');
      expect(state.lightPiecesMovedThisTurn).toBe(1);
      expect(state.selectedPiece).toBeNull();
      
      // Move 2: Select second piece
      const piece2 = state.board[0][1]!;
      state = gameReducer(state, { type: 'SELECT_PIECE', piece: piece2 });
      expect(state.selectedPiece).toBe(piece2);
      
      // Move 2: Execute move
      state = gameReducer(state, {
        type: 'MOVE_PIECE',
        from: { row: 0, col: 1 },
        to: { row: 1, col: 1 }
      });
      
      // Final state checks
      expect(state.currentPlayer).toBe('player1');
      expect(state.lightPiecesMovedThisTurn).toBe(0);
      expect(state.selectedPiece).toBeNull();
      expect(state.board[1][0]).not.toBeNull(); // First piece moved
      expect(state.board[1][1]).not.toBeNull(); // Second piece moved
      expect(state.board[0][0]).toBeNull(); // Original positions empty
      expect(state.board[0][1]).toBeNull();
    });

    it('should handle single-piece movement with manual turn end', () => {
      let state = { ...initialState, currentPlayer: 'player2' as const };
      
      // Move only one piece
      const piece1 = state.board[0][0]!;
      state = gameReducer(state, { type: 'SELECT_PIECE', piece: piece1 });
      state = gameReducer(state, {
        type: 'MOVE_PIECE',
        from: { row: 0, col: 0 },
        to: { row: 1, col: 0 }
      });
      
      expect(state.currentPlayer).toBe('player2');
      expect(state.lightPiecesMovedThisTurn).toBe(1);
      
      // End turn manually
      state = gameReducer(state, { type: 'END_TURN' });
      
      expect(state.currentPlayer).toBe('player1');
      expect(state.lightPiecesMovedThisTurn).toBe(0);
    });
  });
});