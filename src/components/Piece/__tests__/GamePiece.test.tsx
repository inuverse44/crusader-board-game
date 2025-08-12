import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GamePiece from '../GamePiece';
import { GamePiece as GamePieceType } from '../../../types/game';

const mockHeavyPiece: GamePieceType = {
  id: 'heavy-1',
  type: 'heavy',
  player: 'player1',
  position: { row: 7, col: 0 }
};

const mockLightPiece: GamePieceType = {
  id: 'light-1',
  type: 'light',
  player: 'player2',
  position: { row: 0, col: 0 }
};

describe('GamePiece', () => {
  it('renders heavy piece with correct icon', () => {
    render(<GamePiece piece={mockHeavyPiece} isSelected={false} />);
    
    expect(screen.getByText('🛡️')).toBeInTheDocument();
    expect(screen.getByTestId('piece-heavy-1')).toBeInTheDocument();
  });

  it('renders light piece with correct icon', () => {
    render(<GamePiece piece={mockLightPiece} isSelected={false} />);
    
    expect(screen.getByText('⚔️')).toBeInTheDocument();
    expect(screen.getByTestId('piece-light-1')).toBeInTheDocument();
  });

  it('applies correct CSS classes for player1', () => {
    render(<GamePiece piece={mockHeavyPiece} isSelected={false} />);
    
    const pieceElement = screen.getByTestId('piece-heavy-1');
    expect(pieceElement).toHaveClass('game-piece', 'piece-heavy', 'player-player1');
  });

  it('applies correct CSS classes for player2', () => {
    render(<GamePiece piece={mockLightPiece} isSelected={false} />);
    
    const pieceElement = screen.getByTestId('piece-light-1');
    expect(pieceElement).toHaveClass('game-piece', 'piece-light', 'player-player2');
  });

  it('applies selected class when selected', () => {
    render(<GamePiece piece={mockHeavyPiece} isSelected={true} />);
    
    const pieceElement = screen.getByTestId('piece-heavy-1');
    expect(pieceElement).toHaveClass('selected');
  });

  it('applies selectable class when selectable', () => {
    render(<GamePiece piece={mockHeavyPiece} isSelected={false} isSelectable={true} />);
    
    const pieceElement = screen.getByTestId('piece-heavy-1');
    expect(pieceElement).toHaveClass('selectable');
  });

  it('calls onClick when clicked', () => {
    const mockOnClick = jest.fn();
    render(<GamePiece piece={mockHeavyPiece} isSelected={false} onClick={mockOnClick} />);
    
    const pieceElement = screen.getByTestId('piece-heavy-1');
    fireEvent.click(pieceElement);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('stops event propagation when clicked', () => {
    const mockOnClick = jest.fn();
    const mockParentClick = jest.fn();
    
    render(
      <div onClick={mockParentClick}>
        <GamePiece piece={mockHeavyPiece} isSelected={false} onClick={mockOnClick} />
      </div>
    );
    
    const pieceElement = screen.getByTestId('piece-heavy-1');
    fireEvent.click(pieceElement);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
    expect(mockParentClick).not.toHaveBeenCalled();
  });

  it('has correct accessibility attributes', () => {
    render(<GamePiece piece={mockHeavyPiece} isSelected={false} />);
    
    const pieceElement = screen.getByTestId('piece-heavy-1');
    expect(pieceElement).toHaveAttribute('role', 'button');
    expect(pieceElement).toHaveAttribute('tabIndex', '0');
    expect(pieceElement).toHaveAttribute('aria-label', 'player1 heavy piece');
  });
});