import React from 'react';
import GameBoard from './components/Board/GameBoard';
import { GameStatus, GameControls } from './components/UI';
import { useGameState } from './hooks/useGameState';
import { Position, GamePiece } from './types';
import './App.css';

function App() {
  const { gameState, selectPiece, movePiece, attackPiece, endTurn, newGame } = useGameState();

  const handleSquareClick = (position: Position) => {
    if (!gameState.selectedPiece) {
      return;
    }

    // 移動可能な位置かチェック
    const isValidMove = gameState.possibleMoves.some(
      pos => pos.row === position.row && pos.col === position.col
    );
    
    // 攻撃可能な位置かチェック
    const isValidAttack = gameState.possibleAttacks.some(
      pos => pos.row === position.row && pos.col === position.col
    );

    if (isValidMove) {
      movePiece(gameState.selectedPiece.position, position);
    } else if (isValidAttack) {
      attackPiece(gameState.selectedPiece.position, position);
    }
  };

  const handlePieceSelect = (piece: GamePiece) => {
    selectPiece(piece);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>十字軍ボードゲーム</h1>
      </header>
      
      <main className="game-main">
        <div className="game-layout">
          <aside className="game-sidebar">
            <GameStatus gameState={gameState} />
            <GameControls 
              gameState={gameState}
              onNewGame={newGame}
              onEndTurn={endTurn}
            />
          </aside>
          
          <div className="game-board-container">
            <GameBoard
              gameState={gameState}
              onSquareClick={handleSquareClick}
              onPieceSelect={handlePieceSelect}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
