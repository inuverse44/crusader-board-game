import React from 'react';
import { GameState, Position, GamePiece as GamePieceType } from '../../types/game';
import BoardSquare from './BoardSquare';
import './GameBoard.css';

interface GameBoardProps {
  gameState: GameState;
  onSquareClick: (position: Position) => void;
  onPieceSelect: (piece: GamePieceType) => void;
}

const GameBoard: React.FC<GameBoardProps> = ({ gameState, onSquareClick, onPieceSelect }) => {
  const { board, selectedPiece, possibleMoves, possibleAttacks } = gameState;

  const isPositionEqual = (pos1: Position, pos2: Position): boolean => {
    return pos1.row === pos2.row && pos1.col === pos2.col;
  };

  const isPositionInArray = (position: Position, positions: Position[]): boolean => {
    return positions.some(pos => isPositionEqual(pos, position));
  };

  const isPieceSelectable = (piece: GamePieceType): boolean => {
    // 現在のプレイヤーの駒のみ選択可能
    if (piece.player !== gameState.currentPlayer) {
      return false;
    }
    
    // 軽装兵の場合、既に2体移動していたら選択不可
    if (piece.type === 'light' && gameState.lightPiecesMovedThisTurn >= 2) {
      return false;
    }
    
    return true;
  };

  const getHighlightType = (position: Position): 'move' | 'attack' | 'select' | null => {
    if (isPositionInArray(position, possibleMoves)) {
      return 'move';
    }
    if (isPositionInArray(position, possibleAttacks)) {
      return 'attack';
    }
    // 現在のプレイヤーの駒で、選択可能な駒の場合
    const piece = board[position.row][position.col];
    if (piece && isPieceSelectable(piece) && !selectedPiece) {
      return 'select';
    }
    return null;
  };

  const handlePieceClick = (piece: GamePieceType) => {
    if (isPieceSelectable(piece)) {
      onPieceSelect(piece);
    }
  };

  const isSquareSelected = (position: Position): boolean => {
    if (!selectedPiece) return false;
    return isPositionEqual(position, selectedPiece.position);
  };

  const isSquareHighlighted = (position: Position): boolean => {
    const highlightType = getHighlightType(position);
    return highlightType !== null;
  };

  const renderBoard = () => {
    const squares = [];
    
    for (let row = 0; row < 8; row++) {
      const rowSquares = [];
      
      for (let col = 0; col < 8; col++) {
        const position: Position = { row, col };
        const piece = board[row][col];
        const isSelected = isSquareSelected(position);
        const isHighlighted = isSquareHighlighted(position);
        const highlightType = getHighlightType(position);
        
        rowSquares.push(
          <BoardSquare
            key={`${row}-${col}`}
            position={position}
            piece={piece}
            isSelected={isSelected}
            isHighlighted={isHighlighted}
            highlightType={highlightType}
            onClick={onSquareClick}
            onPieceClick={handlePieceClick}
          />
        );
      }
      
      squares.push(
        <div key={row} className="board-row">
          {rowSquares}
        </div>
      );
    }
    
    return squares;
  };

  return (
    <div className="game-board" data-testid="game-board">
      {renderBoard()}
    </div>
  );
};

export default GameBoard;