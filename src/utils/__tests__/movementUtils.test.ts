import {
  isValidPosition,
  positionsEqual,
  calculateHeavyPieceMoves,
  calculateLightPieceMoves,
  calculatePossibleMoves,
  isValidMove,
  EIGHT_DIRECTIONS
} from '../movementUtils';
import { GamePiece, Position } from '../../types';

describe('movementUtils', () => {
  // テスト用のボードを作成するヘルパー関数
  const createEmptyBoard = (): (GamePiece | null)[][] => {
    return Array(8).fill(null).map(() => Array(8).fill(null));
  };

  const createTestPiece = (
    type: 'heavy' | 'light',
    player: 'player1' | 'player2',
    position: Position
  ): GamePiece => ({
    id: `test-${type}-${position.row}-${position.col}`,
    type,
    player,
    position
  });

  describe('isValidPosition', () => {
    it('should return true for valid positions', () => {
      expect(isValidPosition({ row: 0, col: 0 })).toBe(true);
      expect(isValidPosition({ row: 7, col: 7 })).toBe(true);
      expect(isValidPosition({ row: 3, col: 4 })).toBe(true);
    });

    it('should return false for invalid positions', () => {
      expect(isValidPosition({ row: -1, col: 0 })).toBe(false);
      expect(isValidPosition({ row: 0, col: -1 })).toBe(false);
      expect(isValidPosition({ row: 8, col: 0 })).toBe(false);
      expect(isValidPosition({ row: 0, col: 8 })).toBe(false);
      expect(isValidPosition({ row: -1, col: -1 })).toBe(false);
      expect(isValidPosition({ row: 8, col: 8 })).toBe(false);
    });
  });

  describe('positionsEqual', () => {
    it('should return true for equal positions', () => {
      expect(positionsEqual({ row: 3, col: 4 }, { row: 3, col: 4 })).toBe(true);
      expect(positionsEqual({ row: 0, col: 0 }, { row: 0, col: 0 })).toBe(true);
    });

    it('should return false for different positions', () => {
      expect(positionsEqual({ row: 3, col: 4 }, { row: 3, col: 5 })).toBe(false);
      expect(positionsEqual({ row: 3, col: 4 }, { row: 4, col: 4 })).toBe(false);
      expect(positionsEqual({ row: 3, col: 4 }, { row: 4, col: 5 })).toBe(false);
    });
  });

  describe('EIGHT_DIRECTIONS', () => {
    it('should contain all 8 directions', () => {
      expect(EIGHT_DIRECTIONS).toHaveLength(8);
      expect(EIGHT_DIRECTIONS).toContainEqual([-1, -1]); // 上左
      expect(EIGHT_DIRECTIONS).toContainEqual([-1, 0]);  // 上
      expect(EIGHT_DIRECTIONS).toContainEqual([-1, 1]);  // 上右
      expect(EIGHT_DIRECTIONS).toContainEqual([0, -1]);  // 左
      expect(EIGHT_DIRECTIONS).toContainEqual([0, 1]);   // 右
      expect(EIGHT_DIRECTIONS).toContainEqual([1, -1]);  // 下左
      expect(EIGHT_DIRECTIONS).toContainEqual([1, 0]);   // 下
      expect(EIGHT_DIRECTIONS).toContainEqual([1, 1]);   // 下右
    });
  });

  describe('calculateHeavyPieceMoves', () => {
    it('should calculate all 8 possible moves for heavy piece in center', () => {
      const board = createEmptyBoard();
      const piece = createTestPiece('heavy', 'player1', { row: 4, col: 4 });
      
      const moves = calculateHeavyPieceMoves(board, piece);
      
      expect(moves).toHaveLength(8);
      expect(moves).toContainEqual({ row: 3, col: 3 }); // 上左
      expect(moves).toContainEqual({ row: 3, col: 4 }); // 上
      expect(moves).toContainEqual({ row: 3, col: 5 }); // 上右
      expect(moves).toContainEqual({ row: 4, col: 3 }); // 左
      expect(moves).toContainEqual({ row: 4, col: 5 }); // 右
      expect(moves).toContainEqual({ row: 5, col: 3 }); // 下左
      expect(moves).toContainEqual({ row: 5, col: 4 }); // 下
      expect(moves).toContainEqual({ row: 5, col: 5 }); // 下右
    });

    it('should calculate limited moves for heavy piece in corner', () => {
      const board = createEmptyBoard();
      const piece = createTestPiece('heavy', 'player1', { row: 0, col: 0 });
      
      const moves = calculateHeavyPieceMoves(board, piece);
      
      expect(moves).toHaveLength(3);
      expect(moves).toContainEqual({ row: 0, col: 1 }); // 右
      expect(moves).toContainEqual({ row: 1, col: 0 }); // 下
      expect(moves).toContainEqual({ row: 1, col: 1 }); // 下右
    });

    it('should exclude moves blocked by other pieces', () => {
      const board = createEmptyBoard();
      const piece = createTestPiece('heavy', 'player1', { row: 4, col: 4 });
      
      // 他の駒を配置して移動を阻害
      board[3][4] = createTestPiece('light', 'player2', { row: 3, col: 4 });
      board[4][5] = createTestPiece('heavy', 'player1', { row: 4, col: 5 });
      
      const moves = calculateHeavyPieceMoves(board, piece);
      
      expect(moves).toHaveLength(6);
      expect(moves).not.toContainEqual({ row: 3, col: 4 }); // 上（阻害）
      expect(moves).not.toContainEqual({ row: 4, col: 5 }); // 右（阻害）
    });
  });

  describe('calculateLightPieceMoves', () => {
    it('should calculate all 8 possible moves for light piece in center', () => {
      const board = createEmptyBoard();
      const piece = createTestPiece('light', 'player2', { row: 4, col: 4 });
      
      const moves = calculateLightPieceMoves(board, piece);
      
      expect(moves).toHaveLength(8);
      expect(moves).toContainEqual({ row: 3, col: 3 }); // 上左
      expect(moves).toContainEqual({ row: 3, col: 4 }); // 上
      expect(moves).toContainEqual({ row: 3, col: 5 }); // 上右
      expect(moves).toContainEqual({ row: 4, col: 3 }); // 左
      expect(moves).toContainEqual({ row: 4, col: 5 }); // 右
      expect(moves).toContainEqual({ row: 5, col: 3 }); // 下左
      expect(moves).toContainEqual({ row: 5, col: 4 }); // 下
      expect(moves).toContainEqual({ row: 5, col: 5 }); // 下右
    });

    it('should calculate limited moves for light piece at edge', () => {
      const board = createEmptyBoard();
      const piece = createTestPiece('light', 'player2', { row: 0, col: 4 });
      
      const moves = calculateLightPieceMoves(board, piece);
      
      expect(moves).toHaveLength(5);
      expect(moves).toContainEqual({ row: 0, col: 3 }); // 左
      expect(moves).toContainEqual({ row: 0, col: 5 }); // 右
      expect(moves).toContainEqual({ row: 1, col: 3 }); // 下左
      expect(moves).toContainEqual({ row: 1, col: 4 }); // 下
      expect(moves).toContainEqual({ row: 1, col: 5 }); // 下右
    });

    it('should exclude moves blocked by other pieces', () => {
      const board = createEmptyBoard();
      const piece = createTestPiece('light', 'player2', { row: 4, col: 4 });
      
      // 他の駒を配置して移動を阻害
      board[3][3] = createTestPiece('heavy', 'player1', { row: 3, col: 3 });
      board[5][5] = createTestPiece('light', 'player2', { row: 5, col: 5 });
      
      const moves = calculateLightPieceMoves(board, piece);
      
      expect(moves).toHaveLength(6);
      expect(moves).not.toContainEqual({ row: 3, col: 3 }); // 上左（阻害）
      expect(moves).not.toContainEqual({ row: 5, col: 5 }); // 下右（阻害）
    });
  });

  describe('calculatePossibleMoves', () => {
    it('should delegate to calculateHeavyPieceMoves for heavy pieces', () => {
      const board = createEmptyBoard();
      const piece = createTestPiece('heavy', 'player1', { row: 4, col: 4 });
      
      const moves = calculatePossibleMoves(board, piece);
      const expectedMoves = calculateHeavyPieceMoves(board, piece);
      
      expect(moves).toEqual(expectedMoves);
    });

    it('should delegate to calculateLightPieceMoves for light pieces', () => {
      const board = createEmptyBoard();
      const piece = createTestPiece('light', 'player2', { row: 4, col: 4 });
      
      const moves = calculatePossibleMoves(board, piece);
      const expectedMoves = calculateLightPieceMoves(board, piece);
      
      expect(moves).toEqual(expectedMoves);
    });
  });

  describe('isValidMove', () => {
    it('should return true for valid moves', () => {
      const board = createEmptyBoard();
      const piece = createTestPiece('heavy', 'player1', { row: 4, col: 4 });
      
      expect(isValidMove(board, piece, { row: 3, col: 4 })).toBe(true);
      expect(isValidMove(board, piece, { row: 5, col: 5 })).toBe(true);
    });

    it('should return false for invalid moves', () => {
      const board = createEmptyBoard();
      const piece = createTestPiece('heavy', 'player1', { row: 4, col: 4 });
      
      // 2マス以上離れた位置
      expect(isValidMove(board, piece, { row: 2, col: 4 })).toBe(false);
      expect(isValidMove(board, piece, { row: 4, col: 6 })).toBe(false);
      
      // ボード外
      expect(isValidMove(board, piece, { row: -1, col: 4 })).toBe(false);
      expect(isValidMove(board, piece, { row: 4, col: 8 })).toBe(false);
    });

    it('should return false for moves blocked by other pieces', () => {
      const board = createEmptyBoard();
      const piece = createTestPiece('heavy', 'player1', { row: 4, col: 4 });
      
      // 他の駒を配置
      board[3][4] = createTestPiece('light', 'player2', { row: 3, col: 4 });
      
      expect(isValidMove(board, piece, { row: 3, col: 4 })).toBe(false);
    });
  });
});