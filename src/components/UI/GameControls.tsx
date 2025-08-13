import React from 'react';
import { GameState } from '../../types';
import './GameControls.css';

interface GameControlsProps {
  gameState: GameState;
  onNewGame: () => void;
  onEndTurn: () => void;
  // Optional advanced controls
  startingPlayer?: 'player1' | 'player2';
  onStartingPlayerChange?: (player: 'player1' | 'player2') => void;
  cpuPlayer1?: boolean;
  cpuPlayer2?: boolean;
  onToggleCpuPlayer1?: (v: boolean) => void;
  onToggleCpuPlayer2?: (v: boolean) => void;
  enhancedLightMovement?: boolean;
  onToggleEnhancedLightMovement?: (v: boolean) => void;
}

export const GameControls: React.FC<GameControlsProps> = ({ 
  gameState, 
  onNewGame, 
  onEndTurn,
  startingPlayer,
  onStartingPlayerChange,
  cpuPlayer1,
  cpuPlayer2,
  onToggleCpuPlayer1,
  onToggleCpuPlayer2,
  enhancedLightMovement,
  onToggleEnhancedLightMovement,
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
      
      <div className="advanced-settings">
        <fieldset>
          <legend>先行プレイヤー</legend>
          <label>
            <input
              type="radio"
              name="starting-player"
              checked={startingPlayer === 'player1'}
              onChange={() => onStartingPlayerChange && onStartingPlayerChange('player1')}
            />
            重装兵（player1）
          </label>
          <label>
            <input
              type="radio"
              name="starting-player"
              checked={startingPlayer === 'player2'}
              onChange={() => onStartingPlayerChange && onStartingPlayerChange('player2')}
            />
            軽装兵（player2）
          </label>
        </fieldset>

        <fieldset>
          <legend>CPU 設定</legend>
          <label>
            <input
              type="checkbox"
              checked={!!cpuPlayer1}
              onChange={(e) => onToggleCpuPlayer1 && onToggleCpuPlayer1(e.target.checked)}
            />
            CPU: 重装兵（player1）
          </label>
          <label>
            <input
              type="checkbox"
              checked={!!cpuPlayer2}
              onChange={(e) => onToggleCpuPlayer2 && onToggleCpuPlayer2(e.target.checked)}
            />
            CPU: 軽装兵（player2）
          </label>
        </fieldset>

        <fieldset>
          <legend>ルール</legend>
          <label>
            <input
              type="checkbox"
              checked={!!enhancedLightMovement}
              onChange={(e) => onToggleEnhancedLightMovement && onToggleEnhancedLightMovement(e.target.checked)}
            />
            軽装兵の移動を2マスまで許可
          </label>
        </fieldset>
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
