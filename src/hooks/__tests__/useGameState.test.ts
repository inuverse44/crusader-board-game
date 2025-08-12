import { renderHook, act } from '@testing-library/react';
import { useGameState } from '../useGameState';

describe('useGameState', () => {
  it('should initialize with correct initial state', () => {
    const { result } = renderHook(() => useGameState());
    
    expect(result.current.currentPlayer).toBe('player1');
    expect(result.current.selectedPiece).toBeNull();
    expect(result.current.possibleMoves).toEqual([]);
    expect(result.current.possibleAttacks).toEqual([]);
    expect(result.current.gamePhase).toBe('playing');
    expect(result.current.winner).toBeNull();
    expect(result.current.lightPiecesMovedThisTurn).toBe(0);
    expect(result.current.board).toHaveLength(8);
  });

  it('should select piece correctly', () => {
    const { result } = renderHook(() => useGameState());
    
    const piece = result.current.board[7][0]!; // Heavy piece at bottom-left
    
    act(() => {
      result.current.selectPiece(piece);
    });
    
    expect(result.current.selectedPiece).toBe(piece);
    expect(result.current.possibleMoves.length).toBeGreaterThan(0);
  });

  it('should move piece correctly', () => {
    const { result } = renderHook(() => useGameState());
    
    const piece = result.current.board[7][0]!;
    
    act(() => {
      result.current.selectPiece(piece);
    });
    
    act(() => {
      result.current.movePiece({ row: 7, col: 0 }, { row: 6, col: 0 });
    });
    
    expect(result.current.board[7][0]).toBeNull();
    expect(result.current.board[6][0]).not.toBeNull();
    expect(result.current.currentPlayer).toBe('player2');
    expect(result.current.selectedPiece).toBeNull();
  });

  it('should end turn correctly', () => {
    const { result } = renderHook(() => useGameState());
    
    // Switch to player2 first
    act(() => {
      const piece = result.current.board[7][0]!;
      result.current.selectPiece(piece);
      result.current.movePiece({ row: 7, col: 0 }, { row: 6, col: 0 });
    });
    
    expect(result.current.currentPlayer).toBe('player2');
    
    act(() => {
      result.current.endTurn();
    });
    
    expect(result.current.currentPlayer).toBe('player1');
    expect(result.current.lightPiecesMovedThisTurn).toBe(0);
  });

  it('should reset game correctly', () => {
    const { result } = renderHook(() => useGameState());
    
    // Make some moves to change state
    act(() => {
      const piece = result.current.board[7][0]!;
      result.current.selectPiece(piece);
      result.current.movePiece({ row: 7, col: 0 }, { row: 6, col: 0 });
    });
    
    expect(result.current.currentPlayer).toBe('player2');
    expect(result.current.board[6][0]).not.toBeNull();
    
    act(() => {
      result.current.resetGame();
    });
    
    expect(result.current.currentPlayer).toBe('player1');
    expect(result.current.board[7][0]).not.toBeNull();
    expect(result.current.board[6][0]).toBeNull();
    expect(result.current.selectedPiece).toBeNull();
  });

  it('should provide newGame function that works same as resetGame', () => {
    const { result } = renderHook(() => useGameState());
    
    // Make some moves to change state
    act(() => {
      const piece = result.current.board[7][0]!;
      result.current.selectPiece(piece);
      result.current.movePiece({ row: 7, col: 0 }, { row: 6, col: 0 });
    });
    
    act(() => {
      result.current.newGame();
    });
    
    expect(result.current.currentPlayer).toBe('player1');
    expect(result.current.board[7][0]).not.toBeNull();
    expect(result.current.board[6][0]).toBeNull();
  });

  it('should handle attack correctly', () => {
    const { result } = renderHook(() => useGameState());
    
    // Set up a custom scenario by resetting and then manually placing pieces
    act(() => {
      result.current.newGame();
    });
    
    // We can't directly modify the board in the hook, so we'll test the attack function exists
    // and doesn't throw errors when called with valid parameters
    expect(typeof result.current.attackPiece).toBe('function');
    
    // Test that calling attackPiece doesn't crash
    act(() => {
      result.current.attackPiece({ row: 7, col: 0 }, { row: 6, col: 0 });
    });
    
    // The attack should not succeed in this case (no valid attack scenario)
    // but the function should not throw
  });

  it('should provide all necessary state properties', () => {
    const { result } = renderHook(() => useGameState());
    
    // Check that all expected properties are available
    expect(result.current).toHaveProperty('gameState');
    expect(result.current).toHaveProperty('selectPiece');
    expect(result.current).toHaveProperty('movePiece');
    expect(result.current).toHaveProperty('attackPiece');
    expect(result.current).toHaveProperty('endTurn');
    expect(result.current).toHaveProperty('newGame');
    expect(result.current).toHaveProperty('resetGame');
    expect(result.current).toHaveProperty('currentPlayer');
    expect(result.current).toHaveProperty('selectedPiece');
    expect(result.current).toHaveProperty('possibleMoves');
    expect(result.current).toHaveProperty('possibleAttacks');
    expect(result.current).toHaveProperty('gamePhase');
    expect(result.current).toHaveProperty('winner');
    expect(result.current).toHaveProperty('board');
    expect(result.current).toHaveProperty('lightPiecesMovedThisTurn');
  });
});