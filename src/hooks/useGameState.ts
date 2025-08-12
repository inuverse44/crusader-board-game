import { useReducer, useCallback } from 'react';
import { GameState, GameAction, GamePiece, Position } from '../types';
import { gameReducer, createInitialGameState } from '../utils/gameReducer';

export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, null, createInitialGameState);

  // 駒を選択する
  const selectPiece = useCallback((piece: GamePiece) => {
    dispatch({ type: 'SELECT_PIECE', piece });
  }, []);

  // 駒を移動する
  const movePiece = useCallback((from: Position, to: Position) => {
    dispatch({ type: 'MOVE_PIECE', from, to });
  }, []);

  // 駒を攻撃する
  const attackPiece = useCallback((attacker: Position, target: Position) => {
    dispatch({ type: 'ATTACK_PIECE', attacker, target });
  }, []);

  // ターンを終了する
  const endTurn = useCallback(() => {
    dispatch({ type: 'END_TURN' });
  }, []);

  // 新しいゲームを開始する
  const newGame = useCallback(() => {
    dispatch({ type: 'NEW_GAME' });
  }, []);

  // ゲーム状態をリセットする（newGameのエイリアス）
  const resetGame = useCallback(() => {
    dispatch({ type: 'NEW_GAME' });
  }, []);

  return {
    // ゲーム状態
    gameState: state,
    
    // アクション関数
    selectPiece,
    movePiece,
    attackPiece,
    endTurn,
    newGame,
    resetGame,
    
    // 便利なゲッター
    currentPlayer: state.currentPlayer,
    selectedPiece: state.selectedPiece,
    possibleMoves: state.possibleMoves,
    possibleAttacks: state.possibleAttacks,
    gamePhase: state.gamePhase,
    winner: state.winner,
    board: state.board,
    lightPiecesMovedThisTurn: state.lightPiecesMovedThisTurn
  };
}