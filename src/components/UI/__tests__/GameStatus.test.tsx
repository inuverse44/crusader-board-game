import React from 'react';
import { render, screen } from '@testing-library/react';
import { GameStatus } from '../GameStatus';
import { GameState } from '../../../types';

// テスト用のゲーム状態を作成するヘルパー関数
const createTestGameState = (overrides: Partial<GameState> = {}): GameState => {
  const defaultBoard = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // デフォルトで重装兵4体、軽装兵4体を配置
  defaultBoard[7][0] = { id: 'h1', type: 'heavy', player: 'player1', position: { row: 7, col: 0 } };
  defaultBoard[7][1] = { id: 'h2', type: 'heavy', player: 'player1', position: { row: 7, col: 1 } };
  defaultBoard[7][2] = { id: 'h3', type: 'heavy', player: 'player1', position: { row: 7, col: 2 } };
  defaultBoard[7][3] = { id: 'h4', type: 'heavy', player: 'player1', position: { row: 7, col: 3 } };
  
  defaultBoard[0][0] = { id: 'l1', type: 'light', player: 'player2', position: { row: 0, col: 0 } };
  defaultBoard[0][1] = { id: 'l2', type: 'light', player: 'player2', position: { row: 0, col: 1 } };
  defaultBoard[0][2] = { id: 'l3', type: 'light', player: 'player2', position: { row: 0, col: 2 } };
  defaultBoard[0][3] = { id: 'l4', type: 'light', player: 'player2', position: { row: 0, col: 3 } };

  return {
    board: defaultBoard,
    currentPlayer: 'player1',
    selectedPiece: null,
    possibleMoves: [],
    possibleAttacks: [],
    gamePhase: 'playing',
    winner: null,
    lightPiecesMovedThisTurn: 0,
    ...overrides
  };
};

describe('GameStatus', () => {
  it('現在のターンを正しく表示する', () => {
    const gameState = createTestGameState({ currentPlayer: 'player1' });
    render(<GameStatus gameState={gameState} />);
    
    expect(screen.getByText('重装兵のターン')).toBeInTheDocument();
  });

  it('軽装兵のターンを正しく表示する', () => {
    const gameState = createTestGameState({ currentPlayer: 'player2' });
    render(<GameStatus gameState={gameState} />);
    
    expect(screen.getByText('軽装兵のターン')).toBeInTheDocument();
  });

  it('各軍の駒数を正しく表示する', () => {
    const gameState = createTestGameState();
    render(<GameStatus gameState={gameState} />);
    
    expect(screen.getByText('重装兵:')).toBeInTheDocument();
    expect(screen.getByText('軽装兵:')).toBeInTheDocument();
    expect(screen.getAllByText('4体')).toHaveLength(2);
  });

  it('軽装兵の移動可能数を表示する', () => {
    const gameState = createTestGameState({ 
      currentPlayer: 'player2',
      lightPiecesMovedThisTurn: 1
    });
    render(<GameStatus gameState={gameState} />);
    
    expect(screen.getByText('移動可能: 1体')).toBeInTheDocument();
  });

  it('ゲーム終了時に勝者を表示する', () => {
    const gameState = createTestGameState({
      gamePhase: 'gameOver',
      winner: 'player1'
    });
    render(<GameStatus gameState={gameState} />);
    
    expect(screen.getAllByText('重装兵の勝利！')).toHaveLength(2);
    expect(screen.getByText('ゲーム終了')).toBeInTheDocument();
  });

  it('駒数が変化した場合に正しく表示する', () => {
    // 重装兵2体、軽装兵3体の状態を作成
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    board[7][0] = { id: 'h1', type: 'heavy', player: 'player1', position: { row: 7, col: 0 } };
    board[7][1] = { id: 'h2', type: 'heavy', player: 'player1', position: { row: 7, col: 1 } };
    board[0][0] = { id: 'l1', type: 'light', player: 'player2', position: { row: 0, col: 0 } };
    board[0][1] = { id: 'l2', type: 'light', player: 'player2', position: { row: 0, col: 1 } };
    board[0][2] = { id: 'l3', type: 'light', player: 'player2', position: { row: 0, col: 2 } };

    const gameState = createTestGameState({ board });
    render(<GameStatus gameState={gameState} />);
    
    expect(screen.getByText('2体')).toBeInTheDocument();
    expect(screen.getByText('3体')).toBeInTheDocument();
  });

  it('軽装兵のターンでない場合は移動可能数を表示しない', () => {
    const gameState = createTestGameState({ 
      currentPlayer: 'player1',
      lightPiecesMovedThisTurn: 1
    });
    render(<GameStatus gameState={gameState} />);
    
    expect(screen.queryByText(/移動可能:/)).not.toBeInTheDocument();
  });
});