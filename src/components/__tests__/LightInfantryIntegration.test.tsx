import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../../App';

describe('Light Infantry Movement Integration', () => {
  it('should start with heavy infantry turn', () => {
    render(<App />);
    
    // Initially should be heavy infantry turn (player1)
    expect(screen.getByText('重装兵のターン')).toBeInTheDocument();
    
    // The game should show the current player information
    expect(screen.getByText('ゲーム状況')).toBeInTheDocument();
  });

  it('should show end turn button when appropriate', () => {
    render(<App />);
    
    // The end turn button should only appear when:
    // 1. It's player2's turn (light infantry)
    // 2. At least one light piece has moved
    
    // Initially, no end turn button should be visible
    expect(screen.queryByText(/ターン終了/)).not.toBeInTheDocument();
    
    // The new game button should always be visible
    expect(screen.getByText('🔄 新しいゲーム')).toBeInTheDocument();
  });

  it('should not display light infantry move counter during player1 turn', () => {
    render(<App />);
    
    // The move counter should only be visible during player2's turn
    // Since we start with player1, we won't see it initially
    expect(screen.queryByText(/移動可能:/)).not.toBeInTheDocument();
  });

  it('should handle game over state correctly', () => {
    render(<App />);
    
    // Game over elements should not be visible initially
    expect(screen.queryByText('ゲーム終了!')).not.toBeInTheDocument();
    expect(screen.queryByText(/勝利/)).not.toBeInTheDocument();
  });

  it('should render game board with proper structure', () => {
    render(<App />);
    
    // The game board should be rendered
    const gameBoard = screen.getByTestId('game-board');
    expect(gameBoard).toBeInTheDocument();
    
    // Should have the main game layout
    const gameLayout = document.querySelector('.game-layout');
    expect(gameLayout).toBeInTheDocument();
    
    // Should have game controls
    const gameControls = document.querySelector('.game-controls');
    expect(gameControls).toBeInTheDocument();
    
    // Should have game status
    const gameStatus = document.querySelector('.game-status');
    expect(gameStatus).toBeInTheDocument();
  });

  it('should display correct initial piece counts', () => {
    render(<App />);
    
    // Both armies should start with 8 pieces
    expect(screen.getAllByText('8体')).toHaveLength(2);
    
    // Should show piece type labels
    expect(screen.getByText('重装兵:')).toBeInTheDocument();
    expect(screen.getByText('軽装兵:')).toBeInTheDocument();
  });

  it('should show appropriate instructions for heavy infantry turn', () => {
    render(<App />);
    
    // Should show heavy infantry instructions
    expect(screen.getByText('重装兵をクリックして選択')).toBeInTheDocument();
    expect(screen.getByText('1ターンに1体のみ行動可能')).toBeInTheDocument();
    
    // Should not show light infantry instructions
    expect(screen.queryByText('軽装兵をクリックして選択')).not.toBeInTheDocument();
    expect(screen.queryByText('1ターンに最大2体まで行動可能')).not.toBeInTheDocument();
  });
});