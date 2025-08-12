import { GamePiece, Position } from '../../types';
import {
  calculateHeavyPieceForwardAttacks,
  calculateHeavyPieceAdjacentAttacks,
  calculateHeavyPieceAttacks,
  countAdjacentLightPieces,
  calculateLightPieceCooperativeAttacks,
  calculatePossibleAttacks,
  isValidAttack
} from '../movementUtils';

describe('Attack Utils', () => {
  // Helper function to create an empty board
  const createEmptyBoard = (): (GamePiece | null)[][] => {
    return Array(8).fill(null).map(() => Array(8).fill(null));
  };

  // Helper function to create a piece
  const createPiece = (id: string, type: 'heavy' | 'light', player: 'player1' | 'player2', row: number, col: number): GamePiece => ({
    id,
    type,
    player,
    position: { row, col }
  });

  describe('calculateHeavyPieceForwardAttacks', () => {
    it('should calculate forward attacks for player1 heavy piece (upward direction)', () => {
      const board = createEmptyBoard();
      const heavyPiece = createPiece('heavy1', 'heavy', 'player1', 4, 3);
      board[4][3] = heavyPiece;
      
      // Place light pieces in front (upward)
      const lightPiece1 = createPiece('light1', 'light', 'player2', 3, 3);
      const lightPiece2 = createPiece('light2', 'light', 'player2', 2, 3);
      board[3][3] = lightPiece1;
      board[2][3] = lightPiece2;

      const attacks = calculateHeavyPieceForwardAttacks(board, heavyPiece);
      
      expect(attacks).toHaveLength(2);
      expect(attacks).toContainEqual({ row: 3, col: 3 });
      expect(attacks).toContainEqual({ row: 2, col: 3 });
    });

    it('should calculate forward attacks for player2 heavy piece (downward direction)', () => {
      const board = createEmptyBoard();
      const heavyPiece = createPiece('heavy1', 'heavy', 'player2', 3, 3);
      board[3][3] = heavyPiece;
      
      // Place light pieces in front (downward)
      const lightPiece1 = createPiece('light1', 'light', 'player1', 4, 3);
      const lightPiece2 = createPiece('light2', 'light', 'player1', 5, 3);
      board[4][3] = lightPiece1;
      board[5][3] = lightPiece2;

      const attacks = calculateHeavyPieceForwardAttacks(board, heavyPiece);
      
      expect(attacks).toHaveLength(2);
      expect(attacks).toContainEqual({ row: 4, col: 3 });
      expect(attacks).toContainEqual({ row: 5, col: 3 });
    });

    it('should not attack own pieces', () => {
      const board = createEmptyBoard();
      const heavyPiece = createPiece('heavy1', 'heavy', 'player1', 4, 3);
      board[4][3] = heavyPiece;
      
      // Place own light piece in front
      const ownLightPiece = createPiece('light1', 'light', 'player1', 3, 3);
      board[3][3] = ownLightPiece;

      const attacks = calculateHeavyPieceForwardAttacks(board, heavyPiece);
      
      expect(attacks).toHaveLength(0);
    });

    it('should not attack heavy pieces', () => {
      const board = createEmptyBoard();
      const heavyPiece = createPiece('heavy1', 'heavy', 'player1', 4, 3);
      board[4][3] = heavyPiece;
      
      // Place enemy heavy piece in front
      const enemyHeavyPiece = createPiece('heavy2', 'heavy', 'player2', 3, 3);
      board[3][3] = enemyHeavyPiece;

      const attacks = calculateHeavyPieceForwardAttacks(board, heavyPiece);
      
      expect(attacks).toHaveLength(0);
    });
  });

  describe('calculateHeavyPieceAdjacentAttacks', () => {
    it('should calculate adjacent attacks in all 8 directions', () => {
      const board = createEmptyBoard();
      const heavyPiece = createPiece('heavy1', 'heavy', 'player1', 4, 4);
      board[4][4] = heavyPiece;
      
      // Place light pieces in all 8 adjacent positions
      const adjacentPositions = [
        [3, 3], [3, 4], [3, 5],
        [4, 3],         [4, 5],
        [5, 3], [5, 4], [5, 5]
      ];
      
      adjacentPositions.forEach(([row, col], index) => {
        const lightPiece = createPiece(`light${index}`, 'light', 'player2', row, col);
        board[row][col] = lightPiece;
      });

      const attacks = calculateHeavyPieceAdjacentAttacks(board, heavyPiece);
      
      expect(attacks).toHaveLength(8);
      adjacentPositions.forEach(([row, col]) => {
        expect(attacks).toContainEqual({ row, col });
      });
    });

    it('should handle board boundaries correctly', () => {
      const board = createEmptyBoard();
      const heavyPiece = createPiece('heavy1', 'heavy', 'player1', 0, 0); // Corner position
      board[0][0] = heavyPiece;
      
      // Place light pieces in available adjacent positions
      const lightPiece1 = createPiece('light1', 'light', 'player2', 0, 1);
      const lightPiece2 = createPiece('light2', 'light', 'player2', 1, 0);
      const lightPiece3 = createPiece('light3', 'light', 'player2', 1, 1);
      board[0][1] = lightPiece1;
      board[1][0] = lightPiece2;
      board[1][1] = lightPiece3;

      const attacks = calculateHeavyPieceAdjacentAttacks(board, heavyPiece);
      
      expect(attacks).toHaveLength(3);
      expect(attacks).toContainEqual({ row: 0, col: 1 });
      expect(attacks).toContainEqual({ row: 1, col: 0 });
      expect(attacks).toContainEqual({ row: 1, col: 1 });
    });
  });

  describe('countAdjacentLightPieces', () => {
    it('should count adjacent light pieces correctly', () => {
      const board = createEmptyBoard();
      const heavyPiecePosition: Position = { row: 4, col: 4 };
      
      // Place heavy piece
      const heavyPiece = createPiece('heavy1', 'heavy', 'player1', 4, 4);
      board[4][4] = heavyPiece;
      
      // Place 3 light pieces adjacent to heavy piece
      const lightPiece1 = createPiece('light1', 'light', 'player2', 3, 4);
      const lightPiece2 = createPiece('light2', 'light', 'player2', 4, 3);
      const lightPiece3 = createPiece('light3', 'light', 'player2', 5, 4);
      board[3][4] = lightPiece1;
      board[4][3] = lightPiece2;
      board[5][4] = lightPiece3;

      const count = countAdjacentLightPieces(board, heavyPiecePosition, 'player2');
      
      expect(count).toBe(3);
    });

    it('should not count own light pieces', () => {
      const board = createEmptyBoard();
      const heavyPiecePosition: Position = { row: 4, col: 4 };
      
      // Place heavy piece
      const heavyPiece = createPiece('heavy1', 'heavy', 'player1', 4, 4);
      board[4][4] = heavyPiece;
      
      // Place light pieces of same player
      const lightPiece1 = createPiece('light1', 'light', 'player1', 3, 4);
      const lightPiece2 = createPiece('light2', 'light', 'player1', 4, 3);
      board[3][4] = lightPiece1;
      board[4][3] = lightPiece2;

      const count = countAdjacentLightPieces(board, heavyPiecePosition, 'player2');
      
      expect(count).toBe(0);
    });
  });

  describe('calculateLightPieceCooperativeAttacks', () => {
    it('should allow attack when 2 or more light pieces are adjacent to heavy piece', () => {
      const board = createEmptyBoard();
      
      // Place heavy piece
      const heavyPiece = createPiece('heavy1', 'heavy', 'player1', 4, 4);
      board[4][4] = heavyPiece;
      
      // Place 2 light pieces adjacent to heavy piece
      const lightPiece1 = createPiece('light1', 'light', 'player2', 3, 4);
      const lightPiece2 = createPiece('light2', 'light', 'player2', 4, 3);
      board[3][4] = lightPiece1;
      board[4][3] = lightPiece2;

      const attacks = calculateLightPieceCooperativeAttacks(board, lightPiece1);
      
      expect(attacks).toHaveLength(1);
      expect(attacks).toContainEqual({ row: 4, col: 4 });
    });

    it('should not allow attack when only 1 light piece is adjacent to heavy piece', () => {
      const board = createEmptyBoard();
      
      // Place heavy piece
      const heavyPiece = createPiece('heavy1', 'heavy', 'player1', 4, 4);
      board[4][4] = heavyPiece;
      
      // Place only 1 light piece adjacent to heavy piece
      const lightPiece1 = createPiece('light1', 'light', 'player2', 3, 4);
      board[3][4] = lightPiece1;

      const attacks = calculateLightPieceCooperativeAttacks(board, lightPiece1);
      
      expect(attacks).toHaveLength(0);
    });

    it('should not attack own heavy pieces', () => {
      const board = createEmptyBoard();
      
      // Place heavy piece of same player
      const heavyPiece = createPiece('heavy1', 'heavy', 'player2', 4, 4);
      board[4][4] = heavyPiece;
      
      // Place light pieces adjacent to heavy piece
      const lightPiece1 = createPiece('light1', 'light', 'player2', 3, 4);
      const lightPiece2 = createPiece('light2', 'light', 'player2', 4, 3);
      board[3][4] = lightPiece1;
      board[4][3] = lightPiece2;

      const attacks = calculateLightPieceCooperativeAttacks(board, lightPiece1);
      
      expect(attacks).toHaveLength(0);
    });
  });

  describe('calculatePossibleAttacks', () => {
    it('should return heavy piece attacks for heavy pieces', () => {
      const board = createEmptyBoard();
      const heavyPiece = createPiece('heavy1', 'heavy', 'player1', 4, 3);
      board[4][3] = heavyPiece;
      
      // Place light piece in attack range
      const lightPiece = createPiece('light1', 'light', 'player2', 3, 3);
      board[3][3] = lightPiece;

      const attacks = calculatePossibleAttacks(board, heavyPiece);
      
      expect(attacks.length).toBeGreaterThan(0);
      expect(attacks).toContainEqual({ row: 3, col: 3 });
    });

    it('should return cooperative attacks for light pieces', () => {
      const board = createEmptyBoard();
      
      // Place heavy piece
      const heavyPiece = createPiece('heavy1', 'heavy', 'player1', 4, 4);
      board[4][4] = heavyPiece;
      
      // Place 2 light pieces adjacent to heavy piece
      const lightPiece1 = createPiece('light1', 'light', 'player2', 3, 4);
      const lightPiece2 = createPiece('light2', 'light', 'player2', 4, 3);
      board[3][4] = lightPiece1;
      board[4][3] = lightPiece2;

      const attacks = calculatePossibleAttacks(board, lightPiece1);
      
      expect(attacks).toHaveLength(1);
      expect(attacks).toContainEqual({ row: 4, col: 4 });
    });
  });

  describe('isValidAttack', () => {
    it('should return true for valid attacks', () => {
      const board = createEmptyBoard();
      const heavyPiece = createPiece('heavy1', 'heavy', 'player1', 4, 3);
      board[4][3] = heavyPiece;
      
      // Place light piece in attack range
      const lightPiece = createPiece('light1', 'light', 'player2', 3, 3);
      board[3][3] = lightPiece;

      const isValid = isValidAttack(board, heavyPiece, { row: 3, col: 3 });
      
      expect(isValid).toBe(true);
    });

    it('should return false for invalid attacks', () => {
      const board = createEmptyBoard();
      const heavyPiece = createPiece('heavy1', 'heavy', 'player1', 4, 3);
      board[4][3] = heavyPiece;

      const isValid = isValidAttack(board, heavyPiece, { row: 1, col: 1 });
      
      expect(isValid).toBe(false);
    });
  });
});