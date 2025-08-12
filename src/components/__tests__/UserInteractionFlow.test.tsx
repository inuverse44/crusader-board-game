import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../App';

describe('User Interaction Flow Tests', () => {
  it('should handle basic piece selection flow', () => {
    render(<App />);
    
    // Initial state verification
    expect(screen.getByText('重装兵のターン')).toBeInTheDocument();
    expect(screen.getByText('重装兵をクリックして選択')).toBeInTheDocument();
    
    // Step 1: Select heavy piece by clicking on the piece element
    const heavyPieceElement = screen.getByTestId('piece-heavy-p1-0');
    fireEvent.click(heavyPieceElement);
    
    // Verify selection state
    const selectedSquare = screen.getByTestId('square-7-0');
    expect(selectedSquare).toHaveClass('selected');
    
    const moveHighlights = screen.getAllByTestId(/square-\d-\d/).filter(square =>
      square.classList.contains('highlight-move')
    );
    expect(moveHighlights.length).toBeGreaterThan(0);
  });

  it('should handle piece reselection during turn', () => {
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

  it('should prevent selecting opponent pieces', () => {
    render(<App />);
    
    // Try to select light piece during heavy infantry turn
    const lightPieceElement = screen.getByTestId('piece-light-p2-0');
    fireEvent.click(lightPieceElement);
    
    // Should not select the piece
    const lightSquare = screen.getByTestId('square-0-0');
    expect(lightSquare).not.toHaveClass('selected');
    
    // No highlights should appear
    const highlightedSquares = screen.getAllByTestId(/square-\d-\d/).filter(square =>
      square.classList.contains('highlight-move') || square.classList.contains('highlight-attack')
    );
    expect(highlightedSquares).toHaveLength(0);
    
    // Should still be heavy infantry turn
    expect(screen.getByText('重装兵のターン')).toBeInTheDocument();
  });

  it('should handle clicking on empty squares when piece is selected', () => {
    render(<App />);
    
    // Select a piece
    const heavyPieceElement = screen.getByTestId('piece-heavy-p1-0');
    fireEvent.click(heavyPieceElement);
    
    const selectedSquare = screen.getByTestId('square-7-0');
    expect(selectedSquare).toHaveClass('selected');
    
    // Click on an empty square that's not a valid move
    const emptySquare = screen.getByTestId('square-4-4');
    fireEvent.click(emptySquare);
    
    // Selection should remain (since it's not a valid move, nothing should happen)
    expect(selectedSquare).toHaveClass('selected');
  });

  it('should maintain visual feedback consistency', () => {
    render(<App />);
    
    // Select a piece
    const heavyPieceElement = screen.getByTestId('piece-heavy-p1-0');
    fireEvent.click(heavyPieceElement);
    
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
    
    // Non-highlighted squares should not have highlight classes
    const nonHighlightedSquares = screen.getAllByTestId(/square-\d-\d/).filter(square =>
      !square.classList.contains('highlight-move') && !square.classList.contains('highlight-attack')
    );
    
    nonHighlightedSquares.forEach(square => {
      expect(square).not.toHaveClass('highlight-move');
      expect(square).not.toHaveClass('highlight-attack');
    });
  });

  it('should handle new game reset correctly', () => {
    render(<App />);
    
    // Select a piece first
    const heavyPieceElement = screen.getByTestId('piece-heavy-p1-0');
    fireEvent.click(heavyPieceElement);
    
    // Verify piece is selected
    const selectedSquare = screen.getByTestId('square-7-0');
    expect(selectedSquare).toHaveClass('selected');
    
    // Click new game button
    const newGameButton = screen.getByText('🔄 新しいゲーム');
    fireEvent.click(newGameButton);
    
    // Should reset to initial state
    expect(screen.getByText('重装兵のターン')).toBeInTheDocument();
    
    // Selection should be cleared
    expect(selectedSquare).not.toHaveClass('selected');
    
    // No highlights should remain
    const highlightedSquares = screen.getAllByTestId(/square-\d-\d/).filter(square =>
      square.classList.contains('highlight-move') || square.classList.contains('highlight-attack')
    );
    expect(highlightedSquares).toHaveLength(0);
  });

  it('should show appropriate instructions for current player', () => {
    render(<App />);
    
    // Should show heavy infantry instructions initially
    expect(screen.getByText('重装兵をクリックして選択')).toBeInTheDocument();
    expect(screen.getByText('1ターンに1体のみ行動可能')).toBeInTheDocument();
    
    // Should not show light infantry specific instructions
    expect(screen.queryByText('軽装兵をクリックして選択')).not.toBeInTheDocument();
    expect(screen.queryByText('1ターンに最大2体まで行動可能')).not.toBeInTheDocument();
  });

  it('should handle multiple piece selections correctly', () => {
    render(<App />);
    
    // Select multiple pieces in sequence
    const pieces = [
      screen.getByTestId('piece-heavy-p1-0'),
      screen.getByTestId('piece-heavy-p1-1'),
      screen.getByTestId('piece-heavy-p1-2'),
      screen.getByTestId('piece-heavy-p1-3')
    ];
    
    const squares = [
      screen.getByTestId('square-7-0'),
      screen.getByTestId('square-7-1'),
      screen.getByTestId('square-7-2'),
      screen.getByTestId('square-7-3')
    ];
    
    // Click each piece
    pieces.forEach((piece, index) => {
      fireEvent.click(piece);
      
      // Only the current piece should be selected
      squares.forEach((square, squareIndex) => {
        if (squareIndex === index) {
          expect(square).toHaveClass('selected');
        } else {
          expect(square).not.toHaveClass('selected');
        }
      });
    });
    
    // Should still be in heavy infantry turn
    expect(screen.getByText('重装兵のターン')).toBeInTheDocument();
  });

  it('should maintain game state integrity during interactions', () => {
    render(<App />);
    
    // Verify initial piece positions
    expect(screen.getByTestId('square-7-0').textContent).toBe('🛡️'); // Heavy piece
    expect(screen.getByTestId('square-0-0').textContent).toBe('⚔️'); // Light piece
    
    // Select a piece
    const heavyPieceElement = screen.getByTestId('piece-heavy-p1-0');
    fireEvent.click(heavyPieceElement);
    
    // Pieces should still be in their original positions
    expect(screen.getByTestId('square-7-0').textContent).toBe('🛡️');
    expect(screen.getByTestId('square-0-0').textContent).toBe('⚔️');
    
    // Game state should be consistent
    expect(screen.getByText('重装兵のターン')).toBeInTheDocument();
    expect(screen.getAllByText('8体')).toHaveLength(2);
  });
});