import React, { useEffect, useState } from 'react';
import GameBoard from './components/Board/GameBoard';
import { GameStatus, GameControls } from './components/UI';
import { useGameState } from './hooks/useGameState';
import { Position, GamePiece } from './types';
import './App.css';
import { setRulesConfig } from './utils/rulesConfig';
import { calculatePossibleAttacks, calculatePossibleMoves } from './utils/movementUtils';

function App() {
  const { gameState, selectPiece, movePiece, attackPiece, endTurn, newGame, newGameWithOptions } = useGameState();

  // Advanced options (UI only; defaults keep existing tests unchanged)
  const [startingPlayer, setStartingPlayer] = useState<'player1' | 'player2'>('player1');
  const [cpuP1, setCpuP1] = useState(false);
  const [cpuP2, setCpuP2] = useState(false);
  const [enhancedLightMovement, setEnhancedLightMovement] = useState(false);

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

  const handleNewGame = () => {
    setRulesConfig({ enhancedLightMovement });
    newGameWithOptions({ startingPlayer });
  };

  // Simple CPU turn logic (greedy): prefer attack, else first move
  useEffect(() => {
    const isCpuTurn =
      (gameState.currentPlayer === 'player1' && cpuP1) ||
      (gameState.currentPlayer === 'player2' && cpuP2);
    if (!isCpuTurn || gameState.gamePhase !== 'playing') return;

    // Gather candidate actions
    const pieces: GamePiece[] = [];
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const p = gameState.board[r][c];
        if (p && p.player === gameState.currentPlayer) pieces.push(p);
      }
    }

    const findAction = () => {
      for (const p of pieces) {
        const attacks = calculatePossibleAttacks(gameState.board, p);
        if (attacks.length > 0) return { type: 'attack' as const, piece: p, target: attacks[0] };
      }
      for (const p of pieces) {
        const moves = calculatePossibleMoves(gameState.board, p);
        if (moves.length > 0) return { type: 'move' as const, piece: p, target: moves[0] };
      }
      return null;
    };

    const action = findAction();
    if (!action) {
      // No legal action; end turn if light, else do nothing
      if (gameState.currentPlayer === 'player2' && gameState.lightPiecesMovedThisTurn > 0) {
        endTurn();
      }
      return;
    }

    // Perform action via select -> act to satisfy reducer validations
    selectPiece(action.piece);
    const timeout = setTimeout(() => {
      if (action.type === 'attack') {
        attackPiece(action.piece.position, action.target);
      } else {
        movePiece(action.piece.position, action.target);
      }

      // If it's light's turn and still can act, the effect will run again
      // Otherwise, heavy will auto-switch turn after action
    }, 0);

    return () => clearTimeout(timeout);
  }, [gameState.currentPlayer, gameState.board, gameState.gamePhase, gameState.lightPiecesMovedThisTurn, cpuP1, cpuP2]);

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
              onNewGame={handleNewGame}
              onEndTurn={endTurn}
              startingPlayer={startingPlayer}
              onStartingPlayerChange={setStartingPlayer}
              cpuPlayer1={cpuP1}
              cpuPlayer2={cpuP2}
              onToggleCpuPlayer1={setCpuP1}
              onToggleCpuPlayer2={setCpuP2}
              enhancedLightMovement={enhancedLightMovement}
              onToggleEnhancedLightMovement={setEnhancedLightMovement}
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
