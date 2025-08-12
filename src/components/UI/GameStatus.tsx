import React from 'react';
import { GameState, Player } from '../../types';
import './GameStatus.css';

interface GameStatusProps {
  gameState: GameState;
}

export const GameStatus: React.FC<GameStatusProps> = ({ gameState }) => {
  // 各軍の残り駒数を計算
  const countPieces = () => {
    let heavyCount = 0;
    let lightCount = 0;
    
    gameState.board.forEach(row => {
      row.forEach(piece => {
        if (piece) {
          if (piece.type === 'heavy') {
            heavyCount++;
          } else {
            lightCount++;
          }
        }
      });
    });
    
    return { heavyCount, lightCount };
  };

  const { heavyCount, lightCount } = countPieces();

  // プレイヤー名の表示用関数
  const getPlayerDisplayName = (player: Player) => {
    return player === 'player1' ? '重装兵' : '軽装兵';
  };

  // 現在のプレイヤーの表示
  const getCurrentPlayerDisplay = () => {
    const playerName = getPlayerDisplayName(gameState.currentPlayer);
    if (gameState.gamePhase === 'gameOver') {
      return gameState.winner ? `${getPlayerDisplayName(gameState.winner)}の勝利！` : 'ゲーム終了';
    }
    return `${playerName}のターン`;
  };

  // 軽装兵の移動状況表示
  const getLightInfantryStatus = () => {
    if (gameState.currentPlayer === 'player2' && gameState.gamePhase === 'playing') {
      const remaining = 2 - gameState.lightPiecesMovedThisTurn;
      return `移動可能: ${remaining}体`;
    }
    return null;
  };

  return (
    <div className="game-status">
      <div className="game-status-header">
        <h2>ゲーム状況</h2>
      </div>
      
      <div className="current-turn">
        <h3>{getCurrentPlayerDisplay()}</h3>
        {getLightInfantryStatus() && (
          <p className="light-infantry-status">{getLightInfantryStatus()}</p>
        )}
      </div>

      <div className="piece-counts">
        <div className="piece-count heavy-pieces">
          <span className="piece-icon">🛡️</span>
          <span className="piece-label">重装兵:</span>
          <span className="piece-number">{heavyCount}体</span>
        </div>
        <div className="piece-count light-pieces">
          <span className="piece-icon">⚔️</span>
          <span className="piece-label">軽装兵:</span>
          <span className="piece-number">{lightCount}体</span>
        </div>
      </div>

      {gameState.gamePhase === 'gameOver' && (
        <div className="game-over-message">
          <p>ゲーム終了</p>
          {gameState.winner && (
            <p className="winner-message">
              {getPlayerDisplayName(gameState.winner)}の勝利！
            </p>
          )}
        </div>
      )}
    </div>
  );
};