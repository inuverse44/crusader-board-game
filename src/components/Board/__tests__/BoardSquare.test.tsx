import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import BoardSquare from '../BoardSquare';
import { Position, GamePiece } from '../../../types/game';

describe('BoardSquare', () => {
  const mockPosition: Position = { row: 0, col: 0 };
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders empty square correctly', () => {
    render(
      <BoardSquare
        position={mockPosition}
        piece={null}
        isSelected={false}
        isHighlighted={false}
        highlightType={null}
        onClick={mockOnClick}
      />
    );

    const square = screen.getByTestId('square-0-0');
    expect(square).toBeInTheDocument();
  });

  it('renders piece correctly', () => {
    const mockPiece: GamePiece = {
      id: '1',
      type: 'heavy',
      player: 'player1',
      position: mockPosition
    };

    render(
      <BoardSquare
        position={mockPosition}
        piece={mockPiece}
        isSelected={false}
        isHighlighted={false}
        highlightType={null}
        onClick={mockOnClick}
      />
    );

    const square = screen.getByTestId('square-0-0');
    expect(square).toBeInTheDocument();
    expect(square.textContent).toBe('🛡️');
  });

  it('handles click events', () => {
    render(
      <BoardSquare
        position={mockPosition}
        piece={null}
        isSelected={false}
        isHighlighted={false}
        highlightType={null}
        onClick={mockOnClick}
      />
    );

    const square = screen.getByTestId('square-0-0');
    fireEvent.click(square);
    
    expect(mockOnClick).toHaveBeenCalledWith(mockPosition);
  });

  it('applies correct CSS classes for selected state', () => {
    render(
      <BoardSquare
        position={mockPosition}
        piece={null}
        isSelected={true}
        isHighlighted={false}
        highlightType={null}
        onClick={mockOnClick}
      />
    );

    const square = screen.getByTestId('square-0-0');
    expect(square).toHaveClass('selected');
  });

  it('applies correct CSS classes for highlight state', () => {
    render(
      <BoardSquare
        position={mockPosition}
        piece={null}
        isSelected={false}
        isHighlighted={true}
        highlightType="move"
        onClick={mockOnClick}
      />
    );

    const square = screen.getByTestId('square-0-0');
    expect(square).toHaveClass('highlight-move');
  });
});