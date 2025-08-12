import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../App';

describe('App Integration Tests', () => {
  it('should render all main components', () => {
    render(<App />);
    
    // Check that main title is rendered
    expect(screen.getByText('十字軍ボードゲーム')).toBeInTheDocument();
    
    // Check that game board is rendered
    expect(screen.getByTestId('game-board')).toBeInTheDocument();
    
    // Check that game status is rendered
    expect(screen.getByText('重装兵のターン')).toBeInTheDocument();
    
    // Check that game controls are rendered
    expect(screen.getByText('🔄 新しいゲーム')).toBeInTheDocument();
  });

  it('should start with correct initial game state', () => {
    render(<App />);
    
    // Should start with player1 (heavy pieces) turn
    expect(screen.getByText('重装兵のターン')).toBeInTheDocument();
    
    // Should show correct piece counts
    expect(screen.getAllByText('8体')).toHaveLength(2); // Both armies start with 8 pieces
    
    // Should not show end turn button initially
    expect(screen.queryByText(/ターン終了/)).not.toBeInTheDocument();
    
    // Should not show victory message
    expect(screen.queryByText(/勝利/)).not.toBeInTheDocument();
  });

  it('should handle piece selection', () => {
    render(<App />);
    
    // Click on a heavy piece (bottom row) - need to click on the piece itself
    const heavyPieceElement = screen.getByTestId('piece-heavy-p1-0');
    fireEvent.click(heavyPieceElement);
    
    // Should highlight possible moves
    const possibleMoveSquares = screen.getAllByTestId(/square-\d-\d/).filter(square =>
      square.classList.contains('highlight-move')
    );
    expect(possibleMoveSquares.length).toBeGreaterThan(0);
    
    // The square containing the selected piece should be selected
    const selectedSquare = screen.getByTestId('square-7-0');
    expect(selectedSquare).toHaveClass('selected');
  });

  it('should handle new game functionality', () => {
    render(<App />);
    
    // Click new game button
    const newGameButton = screen.getByText('🔄 新しいゲーム');
    fireEvent.click(newGameButton);
    
    // Should maintain initial state
    expect(screen.getByText('重装兵のターン')).toBeInTheDocument();
    
    // Pieces should be in original positions
    const heavyPieceSquare = screen.getByTestId('square-7-0');
    expect(heavyPieceSquare.textContent).toBe('🛡️');
    
    const lightPieceSquare = screen.getByTestId('square-0-0');
    expect(lightPieceSquare.textContent).toBe('⚔️');
  });

  it('should handle invalid interactions gracefully', () => {
    render(<App />);
    
    // Try to click on opponent's piece
    const lightPieceElement = screen.getByTestId('piece-light-p2-0');
    fireEvent.click(lightPieceElement);
    
    // Should not select (no highlights should appear)
    const highlightedSquares = screen.getAllByTestId(/square-\d-\d/).filter(square =>
      square.classList.contains('highlight-move') || square.classList.contains('highlight-attack')
    );
    expect(highlightedSquares).toHaveLength(0);
    
    // Should still be heavy infantry turn
    expect(screen.getByText('重装兵のターン')).toBeInTheDocument();
  });

  it('should display correct piece counts', () => {
    render(<App />);
    
    // Initial state - both armies have 8 pieces
    expect(screen.getAllByText('8体')).toHaveLength(2);
    
    // The piece counts should be displayed in the game status
    expect(screen.getByText('重装兵:')).toBeInTheDocument();
    expect(screen.getByText('軽装兵:')).toBeInTheDocument();
  });

  it('should show correct instructions for current player', () => {
    render(<App />);
    
    // Should show heavy infantry instructions initially
    expect(screen.getByText('重装兵をクリックして選択')).toBeInTheDocument();
    expect(screen.getByText('1ターンに1体のみ行動可能')).toBeInTheDocument();
  });

  it('should handle piece reselection', () => {
    render(<App />);
    
    // Select first heavy piece
    const heavyPiece1 = screen.getByTestId('piece-heavy-p1-0');
    fireEvent.click(heavyPiece1);
    
    const square1 = screen.getByTestId('square-7-0');
    expect(square1).toHaveClass('selected');
    
    // Select different heavy piece
    const heavyPiece2 = screen.getByTestId('piece-heavy-p1-1');
    fireEvent.click(heavyPiece2);
    
    // First piece should no longer be selected
    expect(square1).not.toHaveClass('selected');
    
    // Second piece should be selected
    const square2 = screen.getByTestId('square-7-1');
    expect(square2).toHaveClass('selected');
  });

  it('should maintain visual consistency', () => {
    render(<App />);
    
    // Select a piece
    const heavyPiece = screen.getByTestId('piece-heavy-p1-0');
    fireEvent.click(heavyPiece);
    
    // Check that visual feedback is consistent
    const selectedSquare = screen.getByTestId('square-7-0');
    expect(selectedSquare).toHaveClass('selected');
    
    const moveHighlights = screen.getAllByTestId(/square-\d-\d/).filter(square =>
      square.classList.contains('highlight-move')
    );
    
    // Each highlighted square should have the correct class
    moveHighlights.forEach(square => {
      expect(square).toHaveClass('highlight-move');
      expect(square).not.toHaveClass('highlight-attack');
    });
  });

  it('should handle clicking on empty squares when piece is selected', () => {
    render(<App />);
    
    // Select a piece
    const heavyPiece = screen.getByTestId('piece-heavy-p1-0');
    fireEvent.click(heavyPiece);
    
    // Click on an empty square that's not a valid move
    const emptySquare = screen.getByTestId('square-4-4');
    fireEvent.click(emptySquare);
    
    // Selection should remain (since it's not a valid move, nothing should happen)
    const selectedSquare = screen.getByTestId('square-7-0');
    expect(selectedSquare).toHaveClass('selected');
  });
});