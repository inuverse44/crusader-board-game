import React from 'react';
import { GamePiece as GamePieceType, Position } from '../../types/game';
import { GamePiece } from '../Piece';
import './BoardSquare.css';

interface BoardSquareProps {
  position: Position;
  piece: GamePieceType | null;
  isSelected: boolean;
  isHighlighted: boolean;
  highlightType: 'move' | 'attack' | 'select' | null;
  onClick: (position: Position) => void;
  onPieceClick?: (piece: GamePieceType) => void;
}

const BoardSquare: React.FC<BoardSquareProps> = ({
  position,
  piece,
  isSelected,
  isHighlighted,
  highlightType,
  onClick,
  onPieceClick
}) => {
  const handleClick = () => {
    onClick(position);
  };

  const getSquareClasses = () => {
    const classes = ['board-square'];
    
    // チェス盤の色分け
    const isLight = (position.row + position.col) % 2 === 0;
    classes.push(isLight ? 'light-square' : 'dark-square');
    
    // 選択状態
    if (isSelected) {
      classes.push('selected');
    }
    
    // ハイライト状態
    if (isHighlighted && highlightType) {
      classes.push(`highlight-${highlightType}`);
    }
    
    return classes.join(' ');
  };

  const handlePieceClick = () => {
    if (piece && onPieceClick) {
      onPieceClick(piece);
    }
  };

  const renderPiece = () => {
    if (!piece) return null;
    
    const isSelectable = highlightType === 'select';
    
    return (
      <GamePiece
        piece={piece}
        isSelected={isSelected}
        isSelectable={isSelectable}
        onClick={handlePieceClick}
      />
    );
  };

  return (
    <div 
      className={getSquareClasses()}
      onClick={handleClick}
      data-testid={`square-${position.row}-${position.col}`}
    >
      {renderPiece()}
    </div>
  );
};

export default BoardSquare;