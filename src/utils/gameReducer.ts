import { GameState, GameAction, GamePiece, Player, Position } from '../types';
import { calculatePossibleMoves, calculatePossibleAttacks, positionsEqual } from './movementUtils';

// 初期状態を生成する関数
export function createInitialGameState(): GameState {
  const board: (GamePiece | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
  
  // 重装兵（player1）を最下段に配置
  for (let col = 0; col < 8; col++) {
    const piece: GamePiece = {
      id: `heavy-p1-${col}`,
      type: 'heavy',
      player: 'player1',
      position: { row: 7, col }
    };
    board[7][col] = piece;
  }
  
  // 軽装兵（player2）を最上段に配置
  for (let col = 0; col < 8; col++) {
    const piece: GamePiece = {
      id: `light-p2-${col}`,
      type: 'light',
      player: 'player2',
      position: { row: 0, col }
    };
    board[0][col] = piece;
  }
  
  return {
    board,
    currentPlayer: 'player1', // 重装兵から開始
    selectedPiece: null,
    possibleMoves: [],
    possibleAttacks: [],
    gamePhase: 'playing',
    winner: null,
    lightPiecesMovedThisTurn: 0
  };
}

// Note: positionsEqual is now imported from movementUtils

// ボード上の駒を更新する関数
function updatePiecePosition(board: (GamePiece | null)[][], from: Position, to: Position): (GamePiece | null)[][] {
  const newBoard = board.map(row => [...row]);
  const piece = newBoard[from.row][from.col];
  
  if (piece) {
    piece.position = to;
    newBoard[to.row][to.col] = piece;
    newBoard[from.row][from.col] = null;
  }
  
  return newBoard;
}

// 駒を除去する関数
function removePiece(board: (GamePiece | null)[][], position: Position): (GamePiece | null)[][] {
  const newBoard = board.map(row => [...row]);
  newBoard[position.row][position.col] = null;
  return newBoard;
}

// 勝敗をチェックする関数
function checkWinner(board: (GamePiece | null)[][]): Player | null {
  let heavyCount = 0;
  let lightCount = 0;
  
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece) {
        if (piece.type === 'heavy') heavyCount++;
        if (piece.type === 'light') lightCount++;
      }
    }
  }
  
  if (heavyCount === 0) return 'player2';
  if (lightCount === 0) return 'player1';
  return null;
}

// Note: calculatePossibleMoves and calculatePossibleAttacks are now imported from movementUtils

// ゲーム状態のreducer
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SELECT_PIECE': {
      const { piece } = action;
      
      // 現在のプレイヤーの駒のみ選択可能
      if (piece.player !== state.currentPlayer) {
        return state;
      }
      
      // 軽装兵の場合、既に2体移動していたら選択不可
      if (piece.type === 'light' && state.lightPiecesMovedThisTurn >= 2) {
        return state;
      }
      
      const possibleMoves = calculatePossibleMoves(state.board, piece);
      const possibleAttacks = calculatePossibleAttacks(state.board, piece);
      
      return {
        ...state,
        selectedPiece: piece,
        possibleMoves,
        possibleAttacks
      };
    }
    
    case 'MOVE_PIECE': {
      const { from, to } = action;
      const piece = state.board[from.row][from.col];
      
      if (!piece || !state.selectedPiece) {
        return state;
      }
      
      // 移動可能な位置かチェック
      const isValidMove = state.possibleMoves.some(pos => positionsEqual(pos, to));
      if (!isValidMove) {
        return state;
      }
      
      const newBoard = updatePiecePosition(state.board, from, to);
      let newLightPiecesMovedThisTurn = state.lightPiecesMovedThisTurn;
      let newCurrentPlayer = state.currentPlayer;
      
      // 軽装兵の移動カウント
      if (piece.type === 'light') {
        newLightPiecesMovedThisTurn++;
      }
      
      // ターン切り替えの判定
      if (piece.type === 'heavy' || newLightPiecesMovedThisTurn >= 2) {
        newCurrentPlayer = state.currentPlayer === 'player1' ? 'player2' : 'player1';
        newLightPiecesMovedThisTurn = 0;
      }
      
      return {
        ...state,
        board: newBoard,
        currentPlayer: newCurrentPlayer,
        selectedPiece: null,
        possibleMoves: [],
        possibleAttacks: [],
        lightPiecesMovedThisTurn: newLightPiecesMovedThisTurn
      };
    }
    
    case 'ATTACK_PIECE': {
      const { attacker, target } = action;
      const attackerPiece = state.board[attacker.row][attacker.col];
      
      if (!attackerPiece || !state.selectedPiece) {
        return state;
      }
      
      // 攻撃可能な位置かチェック
      const isValidAttack = state.possibleAttacks.some(pos => positionsEqual(pos, target));
      if (!isValidAttack) {
        return state;
      }
      
      // まず対象を除去
      const boardAfterRemoval = removePiece(state.board, target);
      
      if (attackerPiece.type === 'light') {
        // 軽装兵: 撃破マスへ前進し、行動回数をカウント
        const boardAfterAdvance = updatePiecePosition(boardAfterRemoval, attacker, target);
        const winner = checkWinner(boardAfterAdvance);
        const movedCount = state.lightPiecesMovedThisTurn + 1;
        const reachTurnEnd = movedCount >= 2;
        
        return {
          ...state,
          board: boardAfterAdvance,
          currentPlayer: reachTurnEnd ? 'player1' : 'player2',
          selectedPiece: null,
          possibleMoves: [],
          possibleAttacks: [],
          gamePhase: winner ? 'gameOver' : 'playing',
          winner,
          lightPiecesMovedThisTurn: reachTurnEnd ? 0 : movedCount
        };
      } else {
        // 重装兵: 前進なし、即ターン交代
        const winner = checkWinner(boardAfterRemoval);
        const newCurrentPlayer = state.currentPlayer === 'player1' ? 'player2' : 'player1';
        
        return {
          ...state,
          board: boardAfterRemoval,
          currentPlayer: newCurrentPlayer,
          selectedPiece: null,
          possibleMoves: [],
          possibleAttacks: [],
          gamePhase: winner ? 'gameOver' : 'playing',
          winner,
          lightPiecesMovedThisTurn: 0
        };
      }
    }
    
    case 'END_TURN': {
      // 軽装兵のターン終了
      if (state.currentPlayer === 'player2') {
        return {
          ...state,
          currentPlayer: 'player1',
          selectedPiece: null,
          possibleMoves: [],
          possibleAttacks: [],
          lightPiecesMovedThisTurn: 0
        };
      }
      return state;
    }
    
    case 'NEW_GAME': {
      return createInitialGameState();
    }
    
    default:
      return state;
  }
}
