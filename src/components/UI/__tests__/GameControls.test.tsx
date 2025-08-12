import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameControls } from '../GameControls';
import { GameState } from '../../../types';

// テスト用のゲーム状態を作成するヘルパー関数
const createTestGameState = (overrides: Partial<GameState> = {}): GameState => {
  const defaultBoard = Array(8).fill(null).map(() => Array(8).fill(null));
  
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

describe('GameControls', () => {
  const mockOnNewGame = jest.fn();
  const mockOnEndTurn = jest.fn();

  beforeEach(() => {
    mockOnNewGame.mockClear();
    mockOnEndTurn.mockClear();
  });

  it('新しいゲームボタンを表示する', () => {
    const gameState = createTestGameState();
    render(
      <GameControls 
        gameState={gameState} 
        onNewGame={mockOnNewGame} 
        onEndTurn={mockOnEndTurn} 
      />
    );
    
    expect(screen.getByText('🔄 新しいゲーム')).toBeInTheDocument();
  });

  it('新しいゲームボタンをクリックするとonNewGameが呼ばれる', () => {
    const gameState = createTestGameState();
    render(
      <GameControls 
        gameState={gameState} 
        onNewGame={mockOnNewGame} 
        onEndTurn={mockOnEndTurn} 
      />
    );
    
    fireEvent.click(screen.getByText('🔄 新しいゲーム'));
    expect(mockOnNewGame).toHaveBeenCalledTimes(1);
  });

  it('重装兵のターンではターン終了ボタンを表示しない', () => {
    const gameState = createTestGameState({ currentPlayer: 'player1' });
    render(
      <GameControls 
        gameState={gameState} 
        onNewGame={mockOnNewGame} 
        onEndTurn={mockOnEndTurn} 
      />
    );
    
    expect(screen.queryByText(/ターン終了/)).not.toBeInTheDocument();
  });

  it('軽装兵のターンで移動済みの場合はターン終了ボタンを表示する', () => {
    const gameState = createTestGameState({ 
      currentPlayer: 'player2',
      lightPiecesMovedThisTurn: 1
    });
    render(
      <GameControls 
        gameState={gameState} 
        onNewGame={mockOnNewGame} 
        onEndTurn={mockOnEndTurn} 
      />
    );
    
    expect(screen.getByText(/ターン終了/)).toBeInTheDocument();
    expect(screen.getByText(/残り1体移動可能/)).toBeInTheDocument();
  });

  it('軽装兵のターンで未移動の場合はターン終了ボタンを表示しない', () => {
    const gameState = createTestGameState({ 
      currentPlayer: 'player2',
      lightPiecesMovedThisTurn: 0
    });
    render(
      <GameControls 
        gameState={gameState} 
        onNewGame={mockOnNewGame} 
        onEndTurn={mockOnEndTurn} 
      />
    );
    
    expect(screen.queryByText(/ターン終了/)).not.toBeInTheDocument();
  });

  it('ターン終了ボタンをクリックするとonEndTurnが呼ばれる', () => {
    const gameState = createTestGameState({ 
      currentPlayer: 'player2',
      lightPiecesMovedThisTurn: 1
    });
    render(
      <GameControls 
        gameState={gameState} 
        onNewGame={mockOnNewGame} 
        onEndTurn={mockOnEndTurn} 
      />
    );
    
    fireEvent.click(screen.getByText(/ターン終了/));
    expect(mockOnEndTurn).toHaveBeenCalledTimes(1);
  });

  it('重装兵のターンでは重装兵用の操作方法を表示する', () => {
    const gameState = createTestGameState({ currentPlayer: 'player1' });
    render(
      <GameControls 
        gameState={gameState} 
        onNewGame={mockOnNewGame} 
        onEndTurn={mockOnEndTurn} 
      />
    );
    
    expect(screen.getByText('重装兵をクリックして選択')).toBeInTheDocument();
    expect(screen.getByText('1ターンに1体のみ行動可能')).toBeInTheDocument();
  });

  it('軽装兵のターンでは軽装兵用の操作方法を表示する', () => {
    const gameState = createTestGameState({ currentPlayer: 'player2' });
    render(
      <GameControls 
        gameState={gameState} 
        onNewGame={mockOnNewGame} 
        onEndTurn={mockOnEndTurn} 
      />
    );
    
    expect(screen.getByText('軽装兵をクリックして選択')).toBeInTheDocument();
    expect(screen.getByText('1ターンに最大2体まで行動可能')).toBeInTheDocument();
    expect(screen.getByText('途中でターンを終了することも可能')).toBeInTheDocument();
  });

  it('ゲーム終了時にはゲーム終了メッセージを表示する', () => {
    const gameState = createTestGameState({ 
      gamePhase: 'gameOver',
      winner: 'player1'
    });
    render(
      <GameControls 
        gameState={gameState} 
        onNewGame={mockOnNewGame} 
        onEndTurn={mockOnEndTurn} 
      />
    );
    
    expect(screen.getByText('ゲームが終了しました')).toBeInTheDocument();
    expect(screen.getByText('新しいゲームを開始してください')).toBeInTheDocument();
  });

  it('ゲーム終了時には操作方法を表示しない', () => {
    const gameState = createTestGameState({ 
      gamePhase: 'gameOver',
      winner: 'player1'
    });
    render(
      <GameControls 
        gameState={gameState} 
        onNewGame={mockOnNewGame} 
        onEndTurn={mockOnEndTurn} 
      />
    );
    
    expect(screen.queryByText('操作方法')).not.toBeInTheDocument();
  });

  it('軽装兵が2体移動済みの場合は残り移動数を表示しない', () => {
    const gameState = createTestGameState({ 
      currentPlayer: 'player2',
      lightPiecesMovedThisTurn: 2
    });
    render(
      <GameControls 
        gameState={gameState} 
        onNewGame={mockOnNewGame} 
        onEndTurn={mockOnEndTurn} 
      />
    );
    
    const endTurnButton = screen.getByText(/ターン終了/);
    expect(endTurnButton).toBeInTheDocument();
    expect(screen.queryByText(/残り.*体移動可能/)).not.toBeInTheDocument();
  });
});