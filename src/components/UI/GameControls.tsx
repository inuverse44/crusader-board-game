import React from 'react';
import { GameState } from '../../types';
import './GameControls.css';

interface GameControlsProps {
  gameState: GameState;
  onNewGame: () => void;
  onEndTurn: () => void;
}

export const GameControls: React.FC<GameControlsProps> = ({ 
  gameState, 
  onNewGame, 
  onEndTurn 
}) => {
  // 軽装兵のターン終了ボタンを表示するかどうか
  const showEndTurnButton = () => {
    return gameState.currentPlayer === 'player2' && 
           gameState.gamePhase === 'playing' &&
           gameState.lightPiecesMovedThisTurn > 0;
  };

  // ターン終了ボタンのテキスト
  const getEndTurnButtonText = () => {
    const remaining = 2 - gameState.lightPiecesMovedThisTurn;
    if (remaining > 0) {
      return `ターン終了 (残り${remaining}体移動可能)`;
    }
    return 'ターン終了';
  };

  return (
    <div className="game-controls">
      <div className="game-controls-header">
        <h3>ゲーム操作</h3>
      </div>
      
      <div className="control-buttons">
        <button 
          className="new-game-button"
          onClick={onNewGame}
          type="button"
        >
          🔄 新しいゲーム
        </button>
        
        {showEndTurnButton() && (
          <button 
            className="end-turn-button"
            onClick={onEndTurn}
            type="button"
          >
            ⏭️ {getEndTurnButtonText()}
          </button>
        )}
      </div>

      {gameState.gamePhase === 'playing' && (
        <div className="game-instructions">
          <h4>操作方法</h4>
          <ul>
            {gameState.currentPlayer === 'player1' ? (
              <>
                <li>重装兵をクリックして選択</li>
                <li>移動先または攻撃対象をクリック</li>
                <li>1ターンに1体のみ行動可能</li>
              </>
            ) : (
              <>
                <li>軽装兵をクリックして選択</li>
                <li>移動先または攻撃対象をクリック</li>
                <li>1ターンに最大2体まで行動可能</li>
                <li>途中でターンを終了することも可能</li>
              </>
            )}
          </ul>
        </div>
      )}

      {gameState.gamePhase === 'gameOver' && (
        <div className="game-over-controls">
          <p>ゲームが終了しました</p>
          <p>新しいゲームを開始してください</p>
        </div>
      )}
    </div>
  );
};