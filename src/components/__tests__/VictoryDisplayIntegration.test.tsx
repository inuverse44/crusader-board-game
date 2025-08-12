import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameStatus } from '../UI/GameStatus';
import { GameControls } from '../UI/GameControls';
import { GameState } from '../../types';

// テスト用のゲーム状態を作成するヘルパー関数
const createVictoryGameState = (winner: 'player1' | 'player2'): GameState => {
  const board = Array(8).fill(null).map(() => Array(8).fill(null));
  
  if (winner === 'player1') {
    // 重装兵のみ残存（軽装兵全滅）
    board[7][0] = { id: 'h1', type: 'heavy', player: 'player1', position: { row: 7, col: 0 } };
    board[7][1] = { id: 'h2', type: 'heavy', player: 'player1', position: { row: 7, col: 1 } };
  } else {
    // 軽装兵のみ残存（重装兵全滅）
    board[0][0] = { id: 'l1', type: 'light', player: 'player2', position: { row: 0, col: 0 } };
    board[0][1] = { id: 'l2', type: 'light', player: 'player2', position: { row: 0, col: 1 } };
  }

  return {
    board,
    currentPlayer: 'player1',
    selectedPiece: null,
    possibleMoves: [],
    possibleAttacks: [],
    gamePhase: 'gameOver',
    winner,
    lightPiecesMovedThisTurn: 0
  };
};

describe('Victory Display Integration', () => {
  const mockOnNewGame = jest.fn();
  const mockOnEndTurn = jest.fn();

  beforeEach(() => {
    mockOnNewGame.mockClear();
    mockOnEndTurn.mockClear();
  });

  it('重装兵勝利時に正しい勝利表示を行う', () => {
    const gameState = createVictoryGameState('player1');
    
    render(
      <div>
        <GameStatus gameState={gameState} />
        <GameControls 
          gameState={gameState} 
          onNewGame={mockOnNewGame} 
          onEndTurn={mockOnEndTurn} 
        />
      </div>
    );

    // GameStatusでの勝利表示確認
    expect(screen.getAllByText('重装兵の勝利！')).toHaveLength(2);
    expect(screen.getByText('ゲーム終了')).toBeInTheDocument();
    
    // 駒数の確認
    expect(screen.getByText('2体')).toBeInTheDocument(); // 重装兵2体
    expect(screen.getByText('0体')).toBeInTheDocument(); // 軽装兵0体
    
    // GameControlsでのゲーム終了表示確認
    expect(screen.getByText('ゲームが終了しました')).toBeInTheDocument();
    expect(screen.getByText('新しいゲームを開始してください')).toBeInTheDocument();
    
    // 新しいゲームボタンが利用可能
    expect(screen.getByText('🔄 新しいゲーム')).toBeInTheDocument();
    
    // 操作方法は表示されない
    expect(screen.queryByText('操作方法')).not.toBeInTheDocument();
    
    // ターン終了ボタンは表示されない
    expect(screen.queryByText(/ターン終了/)).not.toBeInTheDocument();
  });

  it('軽装兵勝利時に正しい勝利表示を行う', () => {
    const gameState = createVictoryGameState('player2');
    
    render(
      <div>
        <GameStatus gameState={gameState} />
        <GameControls 
          gameState={gameState} 
          onNewGame={mockOnNewGame} 
          onEndTurn={mockOnEndTurn} 
        />
      </div>
    );

    // GameStatusでの勝利表示確認
    expect(screen.getAllByText('軽装兵の勝利！')).toHaveLength(2);
    expect(screen.getByText('ゲーム終了')).toBeInTheDocument();
    
    // 駒数の確認
    expect(screen.getByText('0体')).toBeInTheDocument(); // 重装兵0体
    expect(screen.getByText('2体')).toBeInTheDocument(); // 軽装兵2体
    
    // GameControlsでのゲーム終了表示確認
    expect(screen.getByText('ゲームが終了しました')).toBeInTheDocument();
    expect(screen.getByText('新しいゲームを開始してください')).toBeInTheDocument();
  });

  it('勝利時に新しいゲームボタンが正常に動作する', () => {
    const gameState = createVictoryGameState('player1');
    
    render(
      <GameControls 
        gameState={gameState} 
        onNewGame={mockOnNewGame} 
        onEndTurn={mockOnEndTurn} 
      />
    );

    // 新しいゲームボタンをクリック
    fireEvent.click(screen.getByText('🔄 新しいゲーム'));
    
    // onNewGameが呼ばれることを確認
    expect(mockOnNewGame).toHaveBeenCalledTimes(1);
    expect(mockOnEndTurn).not.toHaveBeenCalled();
  });

  it('勝利時にはターン表示が勝利メッセージに変わる', () => {
    const gameState = createVictoryGameState('player1');
    
    render(<GameStatus gameState={gameState} />);

    // 通常のターン表示ではなく勝利メッセージが表示される
    expect(screen.queryByText('重装兵のターン')).not.toBeInTheDocument();
    expect(screen.queryByText('軽装兵のターン')).not.toBeInTheDocument();
    expect(screen.getAllByText('重装兵の勝利！')).toHaveLength(2);
  });
});