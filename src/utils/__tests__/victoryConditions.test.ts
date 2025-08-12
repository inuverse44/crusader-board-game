import { gameReducer, createInitialGameState } from '../gameReducer';
import { GameState, GameAction } from '../../types';

describe('Victory Conditions (Requirements 6.1, 6.2)', () => {
  let initialState: GameState;

  beforeEach(() => {
    initialState = createInitialGameState();
  });

  describe('Requirement 6.1: Victory when all enemy pieces are eliminated', () => {
    it('should declare player2 victory when all heavy pieces are eliminated', () => {
      // Create a custom state with only one heavy piece remaining
      const customState = createInitialGameState();
      
      // Remove all heavy pieces except one
      for (let col = 0; col < 8; col++) {
        customState.board[7][col] = null;
      }
      
      // Place the last heavy piece in a vulnerable position
      customState.board[4][4] = {
        id: 'heavy-last',
        type: 'heavy',
        player: 'player1',
        position: { row: 4, col: 4 }
      };
      
      // Place 2 light pieces adjacent to enable cooperative attack
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
      
      // Select light piece and execute cooperative attack
      let state = gameReducer(customState, { 
        type: 'SELECT_PIECE', 
        piece: customState.board[3][4]! 
      });
      
      const attackAction: GameAction = {
        type: 'ATTACK_PIECE',
        attacker: { row: 3, col: 4 },
        target: { row: 4, col: 4 }
      };
      
      const finalState = gameReducer(state, attackAction);
      
      expect(finalState.gamePhase).toBe('gameOver');
      expect(finalState.winner).toBe('player2');
      expect(finalState.board[4][4]).toBeNull(); // Heavy piece should be eliminated
    });

    it('should declare player1 victory when all light pieces are eliminated', () => {
      // Create a custom state with only one light piece remaining
      const customState = createInitialGameState();
      
      // Remove all light pieces except one
      for (let col = 0; col < 8; col++) {
        customState.board[0][col] = null;
      }
      
      // Place the last light piece in attack range of heavy piece
      customState.board[5][0] = {
        id: 'light-last',
        type: 'light',
        player: 'player2',
        position: { row: 5, col: 0 }
      };
      
      customState.currentPlayer = 'player1';
      
      // Select heavy piece and attack the last light piece
      const heavyPiece = customState.board[7][0]!;
      let state = gameReducer(customState, { type: 'SELECT_PIECE', piece: heavyPiece });
      
      const attackAction: GameAction = {
        type: 'ATTACK_PIECE',
        attacker: { row: 7, col: 0 },
        target: { row: 5, col: 0 }
      };
      
      const finalState = gameReducer(state, attackAction);
      
      expect(finalState.gamePhase).toBe('gameOver');
      expect(finalState.winner).toBe('player1');
      expect(finalState.board[5][0]).toBeNull(); // Light piece should be eliminated
    });

    it('should continue game when pieces remain on both sides', () => {
      // Create a scenario where one piece is eliminated but game continues
      const customState = createInitialGameState();
      
      // Place a light piece in attack range
      customState.board[6][0] = {
        id: 'light-vulnerable',
        type: 'light',
        player: 'player2',
        position: { row: 6, col: 0 }
      };
      
      customState.currentPlayer = 'player1';
      
      // Attack the light piece
      const heavyPiece = customState.board[7][0]!;
      let state = gameReducer(customState, { type: 'SELECT_PIECE', piece: heavyPiece });
      
      const attackAction: GameAction = {
        type: 'ATTACK_PIECE',
        attacker: { row: 7, col: 0 },
        target: { row: 6, col: 0 }
      };
      
      const finalState = gameReducer(state, attackAction);
      
      expect(finalState.gamePhase).toBe('playing'); // Game should continue
      expect(finalState.winner).toBeNull();
      expect(finalState.currentPlayer).toBe('player2'); // Turn should switch
    });
  });

  describe('Edge cases for victory detection', () => {
    it('should handle simultaneous elimination correctly', () => {
      // This test ensures that victory is detected immediately after elimination
      const customState = createInitialGameState();
      
      // Set up a scenario where eliminating one piece wins the game
      for (let col = 1; col < 8; col++) {
        customState.board[7][col] = null; // Remove all heavy pieces except first
        customState.board[0][col] = null; // Remove all light pieces except first
      }
      
      // Place the last light piece in attack range
      customState.board[6][0] = customState.board[0][0];
      customState.board[0][0] = null;
      
      if (customState.board[6][0]) {
        customState.board[6][0].position = { row: 6, col: 0 };
      }
      
      customState.currentPlayer = 'player1';
      
      // Attack the last light piece
      const heavyPiece = customState.board[7][0]!;
      let state = gameReducer(customState, { type: 'SELECT_PIECE', piece: heavyPiece });
      
      const attackAction: GameAction = {
        type: 'ATTACK_PIECE',
        attacker: { row: 7, col: 0 },
        target: { row: 6, col: 0 }
      };
      
      const finalState = gameReducer(state, attackAction);
      
      expect(finalState.gamePhase).toBe('gameOver');
      expect(finalState.winner).toBe('player1');
    });

    it('should reset victory state on new game', () => {
      // Create a game over state
      const gameOverState: GameState = {
        ...initialState,
        gamePhase: 'gameOver',
        winner: 'player1'
      };
      
      const newGameState = gameReducer(gameOverState, { type: 'NEW_GAME' });
      
      expect(newGameState.gamePhase).toBe('playing');
      expect(newGameState.winner).toBeNull();
      expect(newGameState.currentPlayer).toBe('player1');
    });
  });

  describe('Victory condition integration with game flow', () => {
    it('should prevent further moves after game over', () => {
      // Create a game over state
      const gameOverState: GameState = {
        ...initialState,
        gamePhase: 'gameOver',
        winner: 'player1'
      };
      
      // Try to select a piece after game over
      const piece = gameOverState.board[0][0]!;
      const newState = gameReducer(gameOverState, { type: 'SELECT_PIECE', piece });
      
      // State should remain unchanged
      expect(newState).toBe(gameOverState);
    });

    it('should maintain game over state through invalid actions', () => {
      const gameOverState: GameState = {
        ...initialState,
        gamePhase: 'gameOver',
        winner: 'player2'
      };
      
      // Try various actions after game over
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
      
      const endTurnAction: GameAction = { type: 'END_TURN' };
      
      expect(gameReducer(gameOverState, moveAction)).toBe(gameOverState);
      expect(gameReducer(gameOverState, attackAction)).toBe(gameOverState);
      expect(gameReducer(gameOverState, endTurnAction)).toBe(gameOverState);
    });
  });
});