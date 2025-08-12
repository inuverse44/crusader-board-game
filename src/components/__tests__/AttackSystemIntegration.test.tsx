import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from '../../App';
import { GameState } from '../../types';
import { createInitialGameState } from '../../utils/gameReducer';

// Mock the useGameState hook to provide controlled test scenarios
jest.mock('../../hooks/useGameState');

describe('Attack System Integration', () => {
  const mockSelectPiece = jest.fn();
  const mockMovePiece = jest.fn();
  const mockAttackPiece = jest.fn();
  const mockEndTurn = jest.fn();
  const mockNewGame = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should highlight attack targets when heavy piece is selected', () => {
    // Create a test scenario where a heavy piece can attack a light piece
    const testGameState: GameState = {
      ...createInitialGameState(),
      selectedPiece: {
        id: 'heavy-p1-0',
        type: 'heavy',
        player: 'player1',
        position: { row: 4, col: 4 }
      },
      possibleMoves: [],
      possibleAttacks: [{ row: 3, col: 4 }, { row: 2, col: 4 }] // Forward attacks
    };

    // Place the heavy piece and light targets on the board
    testGameState.board[4][4] = testGameState.selectedPiece;
    testGameState.board[3][4] = {
      id: 'light-p2-0',
      type: 'light',
      player: 'player2',
      position: { row: 3, col: 4 }
    };
    testGameState.board[2][4] = {
      id: 'light-p2-1',
      type: 'light',
      player: 'player2',
      position: { row: 2, col: 4 }
    };

    const mockUseGameState = require('../../hooks/useGameState').useGameState;
    mockUseGameState.mockReturnValue({
      gameState: testGameState,
      selectPiece: mockSelectPiece,
      movePiece: mockMovePiece,
      attackPiece: mockAttackPiece,
      endTurn: mockEndTurn,
      newGame: mockNewGame
    });

    render(<App />);

    // Check that attack targets are highlighted
    const attackSquare1 = screen.getByTestId('square-3-4');
    const attackSquare2 = screen.getByTestId('square-2-4');
    
    expect(attackSquare1).toHaveClass('highlight-attack');
    expect(attackSquare2).toHaveClass('highlight-attack');
  });

  it('should call attackPiece when clicking on attack target', () => {
    const testGameState: GameState = {
      ...createInitialGameState(),
      selectedPiece: {
        id: 'heavy-p1-0',
        type: 'heavy',
        player: 'player1',
        position: { row: 4, col: 4 }
      },
      possibleMoves: [],
      possibleAttacks: [{ row: 3, col: 4 }]
    };

    testGameState.board[4][4] = testGameState.selectedPiece;
    testGameState.board[3][4] = {
      id: 'light-p2-0',
      type: 'light',
      player: 'player2',
      position: { row: 3, col: 4 }
    };

    const mockUseGameState = require('../../hooks/useGameState').useGameState;
    mockUseGameState.mockReturnValue({
      gameState: testGameState,
      selectPiece: mockSelectPiece,
      movePiece: mockMovePiece,
      attackPiece: mockAttackPiece,
      endTurn: mockEndTurn,
      newGame: mockNewGame
    });

    render(<App />);

    // Click on the attack target
    const attackSquare = screen.getByTestId('square-3-4');
    fireEvent.click(attackSquare);

    expect(mockAttackPiece).toHaveBeenCalledWith(
      { row: 4, col: 4 }, // attacker position
      { row: 3, col: 4 }  // target position
    );
  });

  it('should highlight cooperative attack targets for light pieces', () => {
    const testGameState: GameState = {
      ...createInitialGameState(),
      currentPlayer: 'player2',
      selectedPiece: {
        id: 'light-p2-0',
        type: 'light',
        player: 'player2',
        position: { row: 3, col: 4 }
      },
      possibleMoves: [],
      possibleAttacks: [{ row: 4, col: 4 }] // Cooperative attack on heavy piece
    };

    // Set up cooperative attack scenario
    testGameState.board[3][4] = testGameState.selectedPiece; // First light piece
    testGameState.board[4][3] = { // Second light piece adjacent to heavy piece
      id: 'light-p2-1',
      type: 'light',
      player: 'player2',
      position: { row: 4, col: 3 }
    };
    testGameState.board[4][4] = { // Heavy piece target
      id: 'heavy-p1-0',
      type: 'heavy',
      player: 'player1',
      position: { row: 4, col: 4 }
    };

    const mockUseGameState = require('../../hooks/useGameState').useGameState;
    mockUseGameState.mockReturnValue({
      gameState: testGameState,
      selectPiece: mockSelectPiece,
      movePiece: mockMovePiece,
      attackPiece: mockAttackPiece,
      endTurn: mockEndTurn,
      newGame: mockNewGame
    });

    render(<App />);

    // Check that the heavy piece is highlighted as an attack target
    const attackSquare = screen.getByTestId('square-4-4');
    expect(attackSquare).toHaveClass('highlight-attack');
  });

  it('should call attackPiece for cooperative attack', () => {
    const testGameState: GameState = {
      ...createInitialGameState(),
      currentPlayer: 'player2',
      selectedPiece: {
        id: 'light-p2-0',
        type: 'light',
        player: 'player2',
        position: { row: 3, col: 4 }
      },
      possibleMoves: [],
      possibleAttacks: [{ row: 4, col: 4 }]
    };

    testGameState.board[3][4] = testGameState.selectedPiece;
    testGameState.board[4][3] = {
      id: 'light-p2-1',
      type: 'light',
      player: 'player2',
      position: { row: 4, col: 3 }
    };
    testGameState.board[4][4] = {
      id: 'heavy-p1-0',
      type: 'heavy',
      player: 'player1',
      position: { row: 4, col: 4 }
    };

    const mockUseGameState = require('../../hooks/useGameState').useGameState;
    mockUseGameState.mockReturnValue({
      gameState: testGameState,
      selectPiece: mockSelectPiece,
      movePiece: mockMovePiece,
      attackPiece: mockAttackPiece,
      endTurn: mockEndTurn,
      newGame: mockNewGame
    });

    render(<App />);

    // Click on the heavy piece to attack it
    const attackSquare = screen.getByTestId('square-4-4');
    fireEvent.click(attackSquare);

    expect(mockAttackPiece).toHaveBeenCalledWith(
      { row: 3, col: 4 }, // attacker position
      { row: 4, col: 4 }  // target position
    );
  });

  it('should not highlight invalid attack targets', () => {
    const testGameState: GameState = {
      ...createInitialGameState(),
      selectedPiece: {
        id: 'heavy-p1-0',
        type: 'heavy',
        player: 'player1',
        position: { row: 4, col: 4 }
      },
      possibleMoves: [{ row: 3, col: 3 }], // Only move, no attacks
      possibleAttacks: []
    };

    testGameState.board[4][4] = testGameState.selectedPiece;

    const mockUseGameState = require('../../hooks/useGameState').useGameState;
    mockUseGameState.mockReturnValue({
      gameState: testGameState,
      selectPiece: mockSelectPiece,
      movePiece: mockMovePiece,
      attackPiece: mockAttackPiece,
      endTurn: mockEndTurn,
      newGame: mockNewGame
    });

    render(<App />);

    // Check that no squares are highlighted for attack
    const squares = screen.getAllByTestId(/square-\d-\d/);
    const attackHighlightedSquares = squares.filter(square => 
      square.classList.contains('highlight-attack')
    );
    
    expect(attackHighlightedSquares).toHaveLength(0);
  });
});