import React from 'react';
import { GamePiece as GamePieceType } from '../../types/game';
import './GamePiece.css';

interface GamePieceProps {
  piece: GamePieceType;
  isSelected: boolean;
  isSelectable?: boolean;
  onClick?: () => void;
}

const GamePiece: React.FC<GamePieceProps> = ({
  piece,
  isSelected,
  isSelectable = false,
  onClick
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  const getPieceClasses = () => {
    const classes = ['game-piece'];
    
    // 駒の種類
    classes.push(`piece-${piece.type}`);
    
    // プレイヤー別の色分け
    classes.push(`player-${piece.player}`);
    
    // 選択状態
    if (isSelected) {
      classes.push('selected');
    }
    
    // 選択可能状態
    if (isSelectable) {
      classes.push('selectable');
    }
    
    return classes.join(' ');
  };

  const getPieceIcon = () => {
    if (piece.type === 'heavy') {
      return '🛡️'; // 重装兵は盾のアイコン
    } else {
      return '⚔️'; // 軽装兵は剣のアイコン
    }
  };

  return (
    <div 
      className={getPieceClasses()}
      onClick={handleClick}
      data-testid={`piece-${piece.id}`}
      role="button"
      tabIndex={0}
      aria-label={`${piece.player} ${piece.type} piece`}
    >
      <span className="piece-icon">
        {getPieceIcon()}
      </span>
    </div>
  );
};

export default GamePiece;