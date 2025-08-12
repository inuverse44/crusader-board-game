import { gameReducer, createInitialGameState } from '../gameReducer';
import { GameState, GameAction, GamePiece } from '../../types';

describe('gameReducer', () => {
  let initialState: GameState;

  beforeEach(() => {
    initialState = createInitialGameState();
  });

  describe('createInitialGameState', () => {
    it('should create initial game state with correct board setup', () => {
      expect(initialState.board).toHaveLength(8);
      expect(initialState.board[0]).toHaveLength(8);
      
      // Check heavy pieces (player1) at bottom row
      for (let col = 0; col < 8; col++) {
        const piece = initialState.board[7][col];
        expect(piece).not.toBeNull();
        expect(piece!.type).toBe('heavy');
        expect(piece!.player).toBe('player1');
        expect(piece!.position).toEqual({ row: 7, col });
      }
      
      // Check light pieces (player2) at top row
      for (let col = 0; col < 8; col++) {
        const piece = initialState.board[0][col];
        expect(piece).not.toBeNull();
        expect(piece!.type).toBe('light');
        expect(piece!.player).toBe('player2');
        expect(piece!.position).toEqual({ row: 0, col });
      }
      
      // Check middle rows are empty
      for (let row = 1; row < 7; row++) {
        for (let col = 0; col < 8; col++) {
          expect(initialState.board[row][col]).toBeNull();
        }
      }
    });

    it('should set correct initial game state properties', () => {
      expect(initialState.currentPlayer).toBe('player1');
      expect(initialState.selectedPiece).toBeNull();
      expect(initialState.possibleMoves).toEqual([]);
      expect(initialState.possibleAttacks).toEqual([]);
      expect(initialState.gamePhase).toBe('playing');
      expect(initialState.winner).toBeNull();
      expect(initialState.lightPiecesMovedThisTurn).toBe(0);
    });
  });

  describe('SELECT_PIECE action', () => {
    it('should select a piece and calculate possible moves', () => {
      const piece = initialState.board[7][0]!; // Heavy piece at bottom-left
      const action: GameAction = { type: 'SELECT_PIECE', piece };
      
      const newState = gameReducer(initialState, action);
      
      expect(newState.selectedPiece).toBe(piece);
      expect(newState.possibleMoves).toHaveLength(2); // Can move up, up-right (right is occupied)
      expect(newState.possibleMoves).toContainEqual({ row: 6, col: 0 });
      expect(newState.possibleMoves).toContainEqual({ row: 6, col: 1 });
    });

    it('should not select opponent piece', () => {
      const opponentPiece = initialState.board[0][0]!; // Light piece (player2)
      const action: GameAction = { type: 'SELECT_PIECE', piece: opponentPiece };
      
      const newState = gameReducer(initialState, action);
      
      expect(newState.selectedPiece).toBeNull();
      expect(newState).toBe(initialState); // State should not change
    });

    it('should not select light piece if already moved 2 pieces this turn', () => {
      // Set up state where player2 has already moved 2 light pieces
      const stateWithMovedPieces = {
        ...initialState,
        currentPlayer: 'player2' as const,
        lightPiecesMovedThisTurn: 2
      };
      
      const lightPiece = initialState.board[0][0]!;
      const action: GameAction = { type: 'SELECT_PIECE', piece: lightPiece };
      
      const newState = gameReducer(stateWithMovedPieces, action);
      
      expect(newState.selectedPiece).toBeNull();
    });
  });

  describe('MOVE_PIECE action', () => {
    it('should move a heavy piece and switch turn', () => {
      // First select a piece
      const piece = initialState.board[7][0]!;
      let state = gameReducer(initialState, { type: 'SELECT_PIECE', piece });
      
      // Then move it
      const moveAction: GameAction = {
        type: 'MOVE_PIECE',
        from: { row: 7, col: 0 },
        to: { row: 6, col: 0 }
      };
      
      const newState = gameReducer(state, moveAction);
      
      expect(newState.board[7][0]).toBeNull();
      expect(newState.board[6][0]).not.toBeNull();
      expect(newState.board[6][0]!.position).toEqual({ row: 6, col: 0 });
      expect(newState.currentPlayer).toBe('player2');
      expect(newState.selectedPiece).toBeNull();
      expect(newState.possibleMoves).toEqual([]);
    });

    it('should move light piece and increment counter', () => {
      // Set up player2 turn
      const player2State = { ...initialState, currentPlayer: 'player2' as const };
      
      // Select and move first light piece
      const piece = player2State.board[0][0]!;
      let state = gameReducer(player2State, { type: 'SELECT_PIECE', piece });
      
      const moveAction: GameAction = {
        type: 'MOVE_PIECE',
        from: { row: 0, col: 0 },
        to: { row: 1, col: 0 }
      };
      
      const newState = gameReducer(state, moveAction);
      
      expect(newState.lightPiecesMovedThisTurn).toBe(1);
      expect(newState.currentPlayer).toBe('player2'); // Still player2's turn
    });

    it('should switch turn after moving 2 light pieces', () => {
      // Set up state where 1 light piece has already moved
      const stateWith1Move = {
        ...initialState,
        currentPlayer: 'player2' as const,
        lightPiecesMovedThisTurn: 1
      };
      
      // Select and move second light piece
      const piece = stateWith1Move.board[0][1]!;
      let state = gameReducer(stateWith1Move, { type: 'SELECT_PIECE', piece });
      
      const moveAction: GameAction = {
        type: 'MOVE_PIECE',
        from: { row: 0, col: 1 },
        to: { row: 1, col: 1 }
      };
      
      const newState = gameReducer(state, moveAction);
      
      expect(newState.currentPlayer).toBe('player1');
      expect(newState.lightPiecesMovedThisTurn).toBe(0);
    });

    it('should not move to invalid position', () => {
      const piece = initialState.board[7][0]!;
      let state = gameReducer(initialState, { type: 'SELECT_PIECE', piece });
      
      // Try to move to invalid position (occupied by another piece)
      const invalidMoveAction: GameAction = {
        type: 'MOVE_PIECE',
        from: { row: 7, col: 0 },
        to: { row: 7, col: 1 } // This position is occupied
      };
      
      const newState = gameReducer(state, invalidMoveAction);
      
      expect(newState).toBe(state); // State should not change
    });
  });  describe
('ATTACK_PIECE action', () => {
    it('should allow heavy piece to attack light piece in front', () => {
      // Set up a scenario where a light piece is in front of heavy piece
      const customState = createInitialGameState();
      customState.board[5][0] = {
        id: 'light-test',
        type: 'light',
        player: 'player2',
        position: { row: 5, col: 0 }
      };
      
      // Select heavy piece
      const heavyPiece = customState.board[7][0]!;
      let state = gameReducer(customState, { type: 'SELECT_PIECE', piece: heavyPiece });
      
      // Attack the light piece
      const attackAction: GameAction = {
        type: 'ATTACK_PIECE',
        attacker: { row: 7, col: 0 },
        target: { row: 5, col: 0 }
      };
      
      const newState = gameReducer(state, attackAction);
      
      expect(newState.board[5][0]).toBeNull(); // Light piece should be removed
      expect(newState.currentPlayer).toBe('player2'); // Turn should switch
      expect(newState.selectedPiece).toBeNull();
    });

    it('should allow light pieces to cooperatively attack heavy piece', () => {
      // Set up scenario with 2 light pieces adjacent to a heavy piece
      const customState = createInitialGameState();
      
      // Place heavy piece in middle
      customState.board[4][4] = {
        id: 'heavy-test',
        type: 'heavy',
        player: 'player1',
        position: { row: 4, col: 4 }
      };
      
      // Place 2 light pieces adjacent to heavy piece
      customState.board[3][4] = {
        id: 'light-test1',
        type: 'light',
        player: 'player2',
        position: { row: 3, col: 4 }
      };
      customState.board[4][3] = {
        id: 'light-test2',
        type: 'light',
        player: 'player2',
        position: { row: 4, col: 3 }
      };
      
      customState.currentPlayer = 'player2';
      
      // Select one of the light pieces
      const lightPiece = customState.board[3][4]!;
      let state = gameReducer(customState, { type: 'SELECT_PIECE', piece: lightPiece });
      
      // Should be able to attack the heavy piece
      expect(state.possibleAttacks).toContainEqual({ row: 4, col: 4 });
      
      // Execute attack
      const attackAction: GameAction = {
        type: 'ATTACK_PIECE',
        attacker: { row: 3, col: 4 },
        target: { row: 4, col: 4 }
      };
      
      const newState = gameReducer(state, attackAction);
      
      expect(newState.board[4][4]).toBeNull(); // Heavy piece should be removed
      expect(newState.currentPlayer).toBe('player1');
    });

    it('should not allow single light piece to attack heavy piece', () => {
      // Set up scenario with only 1 light piece adjacent to heavy piece
      const customState = createInitialGameState();
      
      customState.board[4][4] = {
        id: 'heavy-test',
        type: 'heavy',
        player: 'player1',
        position: { row: 4, col: 4 }
      };
      
      customState.board[3][4] = {
        id: 'light-test1',
        type: 'light',
        player: 'player2',
        position: { row: 3, col: 4 }
      };
      
      customState.currentPlayer = 'player2';
      
      const lightPiece = customState.board[3][4]!;
      const state = gameReducer(customState, { type: 'SELECT_PIECE', piece: lightPiece });
      
      // Should not be able to attack (no cooperative attack possible)
      expect(state.possibleAttacks).not.toContainEqual({ row: 4, col: 4 });
    });
  });

  describe('END_TURN action', () => {
    it('should end light pieces turn and switch to heavy pieces', () => {
      const player2State = {
        ...initialState,
        currentPlayer: 'player2' as const,
        lightPiecesMovedThisTurn: 1
      };
      
      const newState = gameReducer(player2State, { type: 'END_TURN' });
      
      expect(newState.currentPlayer).toBe('player1');
      expect(newState.lightPiecesMovedThisTurn).toBe(0);
      expect(newState.selectedPiece).toBeNull();
    });

    it('should not end turn for heavy pieces player', () => {
      const newState = gameReducer(initialState, { type: 'END_TURN' });
      
      expect(newState).toBe(initialState); // State should not change
    });
  });

  describe('NEW_GAME action', () => {
    it('should reset game to initial state', () => {
      // Modify state
      const modifiedState = {
        ...initialState,
        currentPlayer: 'player2' as const,
        gamePhase: 'gameOver' as const,
        winner: 'player1' as const
      };
      
      const newState = gameReducer(modifiedState, { type: 'NEW_GAME' });
      
      expect(newState.currentPlayer).toBe('player1');
      expect(newState.gamePhase).toBe('playing');
      expect(newState.winner).toBeNull();
      expect(newState.selectedPiece).toBeNull();
    });
  });

  describe('Win condition', () => {
    it('should detect player2 win when all heavy pieces are eliminated', () => {
      // Create state with only light pieces
      const customState = createInitialGameState();
      
      // Remove all heavy pieces
      for (let col = 0; col < 8; col++) {
        customState.board[7][col] = null;
      }
      
      // Set up attack scenario
      customState.board[4][4] = {
        id: 'heavy-last',
        type: 'heavy',
        player: 'player1',
        position: { row: 4, col: 4 }
      };
      
      customState.board[3][4] = {
        id: 'light-1',
        type: 'light',
        player: 'player2',
        position: { row: 3, col: 4 }
      };
      
      customState.board[4][3] = {
        id: 'light-2',
        type: 'light',
        player: 'player2',
        position: { row: 4, col: 3 }
      };
      
      customState.currentPlayer = 'player2';
      
      // Select light piece and attack last heavy piece
      let state = gameReducer(customState, { 
        type: 'SELECT_PIECE', 
        piece: customState.board[3][4]! 
      });
      
      const attackAction: GameAction = {
        type: 'ATTACK_PIECE',
        attacker: { row: 3, col: 4 },
        target: { row: 4, col: 4 }
      };
      
      const newState = gameReducer(state, attackAction);
      
      expect(newState.gamePhase).toBe('gameOver');
      expect(newState.winner).toBe('player2');
    });

    it('should detect player1 win when all light pieces are eliminated', () => {
      // Create state with only heavy pieces
      const customState = createInitialGameState();
      
      // Remove all light pieces except one
      for (let col = 0; col < 8; col++) {
        customState.board[0][col] = null;
      }
      
      // Place last light piece in attack range
      customState.board[5][0] = {
        id: 'light-last',
        type: 'light',
        player: 'player2',
        position: { row: 5, col: 0 }
      };
      
      // Select heavy piece and attack last light piece
      const heavyPiece = customState.board[7][0]!;
      let state = gameReducer(customState, { type: 'SELECT_PIECE', piece: heavyPiece });
      
      const attackAction: GameAction = {
        type: 'ATTACK_PIECE',
        attacker: { row: 7, col: 0 },
        target: { row: 5, col: 0 }
      };
      
      const newState = gameReducer(state, attackAction);
      
      expect(newState.gamePhase).toBe('gameOver');
      expect(newState.winner).toBe('player1');
    });
  });
});