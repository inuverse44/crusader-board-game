import React from 'react';
import { render, screen } from '@testing-library/react';
import GameBoard from '../GameBoard';
import { GameState } from '../../../types/game';

describe('GameBoard', () => {
  const mockOnSquareClick = jest.fn();

  const mockGameState: GameState = {
    board: Array(8).fill(null).map(() => Array(8).fill(null)),
    currentPlayer: 'player1',
    selectedPiece: null,
    possibleMoves: [],
    possibleAttacks: [],
    gamePhase: 'playing',
    winner: null,
    lightPiecesMovedThisTurn: 0
  };

  beforeEach(() => {
    mockOnSquareClick.mockClear();
  });

  it('renders 8x8 board correctly', () => {
    render(
      <GameBoard
        gameState={mockGameState}
        onSquareClick={mockOnSquareClick}
      />
    );

    const board = screen.getByTestId('game-board');
    expect(board).toBeInTheDocument();

    // Check that all 64 squares are rendered
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const square = screen.getByTestId(`square-${row}-${col}`);
        expect(square).toBeInTheDocument();
      }
    }
  });

  it('renders pieces on the board', () => {
    const gameStateWithPieces: GameState = {
      ...mockGameState,
      board: mockGameState.board.map((row, rowIndex) =>
        row.map((_, colIndex) => {
          if (rowIndex === 0 && colIndex === 0) {
            return {
              id: '1',
              type: 'heavy' as const,
              player: 'player1' as const,
              position: { row: 0, col: 0 }
            };
          }
          return null;
        })
      )
    };

    render(
      <GameBoard
        gameState={gameStateWithPieces}
        onSquareClick={mockOnSquareClick}
      />
    );

    const square = screen.getByTestId('square-0-0');
    expect(square.textContent).toBe('🛡️');
  });
});