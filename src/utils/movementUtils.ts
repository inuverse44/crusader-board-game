import { GamePiece, Position, Player } from '../types';

/**
 * 位置がボード範囲内かどうかをチェックする
 */
export function isValidPosition(position: Position): boolean {
  return position.row >= 0 && position.row < 8 && position.col >= 0 && position.col < 8;
}

/**
 * 2つの位置が同じかどうかをチェックする
 */
export function positionsEqual(pos1: Position, pos2: Position): boolean {
  return pos1.row === pos2.row && pos1.col === pos2.col;
}

/**
 * 全8方向の移動方向を定義
 */
export const EIGHT_DIRECTIONS: [number, number][] = [
  [-1, -1], [-1, 0], [-1, 1],  // 上左、上、上右
  [0, -1],           [0, 1],   // 左、右
  [1, -1],  [1, 0],  [1, 1]    // 下左、下、下右
];

/**
 * 重装兵の移動可能範囲を計算する
 * 全8方向に1マス移動可能、他の駒がいる場所は除外
 */
export function calculateHeavyPieceMoves(
  board: (GamePiece | null)[][],
  piece: GamePiece
): Position[] {
  const moves: Position[] = [];
  const { row, col } = piece.position;

  for (const [dRow, dCol] of EIGHT_DIRECTIONS) {
    const newPosition: Position = {
      row: row + dRow,
      col: col + dCol
    };

    // ボード範囲内かチェック
    if (isValidPosition(newPosition)) {
      // そのマスが空いているかチェック（他の駒との衝突判定）
      if (board[newPosition.row][newPosition.col] === null) {
        moves.push(newPosition);
      }
    }
  }

  return moves;
}

/**
 * 軽装兵の移動可能範囲を計算する
 * 全8方向に1マス移動可能、他の駒がいる場所は除外
 */
export function calculateLightPieceMoves(
  board: (GamePiece | null)[][],
  piece: GamePiece
): Position[] {
  const moves: Position[] = [];
  const { row, col } = piece.position;

  for (const [dRow, dCol] of EIGHT_DIRECTIONS) {
    const newPosition: Position = {
      row: row + dRow,
      col: col + dCol
    };

    // ボード範囲内かチェック
    if (isValidPosition(newPosition)) {
      // そのマスが空いているかチェック（他の駒との衝突判定）
      if (board[newPosition.row][newPosition.col] === null) {
        moves.push(newPosition);
      }
    }
  }

  return moves;
}

/**
 * 駒の移動可能範囲を計算する（統合関数）
 */
export function calculatePossibleMoves(
  board: (GamePiece | null)[][],
  piece: GamePiece
): Position[] {
  switch (piece.type) {
    case 'heavy':
      return calculateHeavyPieceMoves(board, piece);
    case 'light':
      return calculateLightPieceMoves(board, piece);
    default:
      return [];
  }
}

/**
 * 指定された位置に移動可能かどうかをチェックする
 */
export function isValidMove(
  board: (GamePiece | null)[][],
  piece: GamePiece,
  targetPosition: Position
): boolean {
  const possibleMoves = calculatePossibleMoves(board, piece);
  return possibleMoves.some(move => positionsEqual(move, targetPosition));
}

/**
 * 重装兵の前方2マス攻撃範囲を計算する
 * player1の重装兵は上方向（row減少方向）が前方
 * player2の重装兵は下方向（row増加方向）が前方
 */
export function calculateHeavyPieceForwardAttacks(
  board: (GamePiece | null)[][],
  piece: GamePiece
): Position[] {
  const attacks: Position[] = [];
  const { row, col } = piece.position;
  
  // 前方の方向を決定（player1は上方向、player2は下方向）
  const forwardDirection = piece.player === 'player1' ? -1 : 1;
  
  // 前方2マス以内をチェック
  for (let distance = 1; distance <= 2; distance++) {
    const targetRow = row + (forwardDirection * distance);
    
    if (isValidPosition({ row: targetRow, col })) {
      const target = board[targetRow][col];
      if (target && target.type === 'light' && target.player !== piece.player) {
        attacks.push({ row: targetRow, col });
      }
    }
  }
  
  return attacks;
}

/**
 * 重装兵の隣接マス攻撃範囲を計算する
 * 全8方向の隣接マスをチェック
 */
export function calculateHeavyPieceAdjacentAttacks(
  board: (GamePiece | null)[][],
  piece: GamePiece
): Position[] {
  const attacks: Position[] = [];
  const { row, col } = piece.position;
  
  for (const [dRow, dCol] of EIGHT_DIRECTIONS) {
    const targetPosition: Position = {
      row: row + dRow,
      col: col + dCol
    };
    
    if (isValidPosition(targetPosition)) {
      const target = board[targetPosition.row][targetPosition.col];
      if (target && target.type === 'light' && target.player !== piece.player) {
        attacks.push(targetPosition);
      }
    }
  }
  
  return attacks;
}

/**
 * 重装兵の全攻撃範囲を計算する
 * 前方2マス + 隣接マスの攻撃範囲を統合
 */
export function calculateHeavyPieceAttacks(
  board: (GamePiece | null)[][],
  piece: GamePiece
): Position[] {
  const forwardAttacks = calculateHeavyPieceForwardAttacks(board, piece);
  const adjacentAttacks = calculateHeavyPieceAdjacentAttacks(board, piece);
  
  // 重複を除去して統合
  const allAttacks = [...forwardAttacks, ...adjacentAttacks];
  const uniqueAttacks = allAttacks.filter((attack, index, array) => 
    array.findIndex(a => positionsEqual(a, attack)) === index
  );
  
  return uniqueAttacks;
}/**

 * 指定された重装兵に隣接する軽装兵の数を数える
 */
export function countAdjacentLightPieces(
  board: (GamePiece | null)[][],
  heavyPiecePosition: Position,
  lightPlayer: Player
): number {
  let count = 0;
  const { row, col } = heavyPiecePosition;
  
  for (const [dRow, dCol] of EIGHT_DIRECTIONS) {
    const adjacentPosition: Position = {
      row: row + dRow,
      col: col + dCol
    };
    
    if (isValidPosition(adjacentPosition)) {
      const adjacentPiece = board[adjacentPosition.row][adjacentPosition.col];
      if (adjacentPiece && 
          adjacentPiece.type === 'light' && 
          adjacentPiece.player === lightPlayer) {
        count++;
      }
    }
  }
  
  return count;
}

/**
 * 軽装兵の協力攻撃可能な重装兵を検出する
 * 2体以上の軽装兵が隣接している重装兵のみ攻撃可能
 */
export function calculateLightPieceCooperativeAttacks(
  board: (GamePiece | null)[][],
  piece: GamePiece
): Position[] {
  const attacks: Position[] = [];
  const { row, col } = piece.position;
  
  // 隣接する重装兵を探す
  for (const [dRow, dCol] of EIGHT_DIRECTIONS) {
    const targetPosition: Position = {
      row: row + dRow,
      col: col + dCol
    };
    
    if (isValidPosition(targetPosition)) {
      const target = board[targetPosition.row][targetPosition.col];
      if (target && target.type === 'heavy' && target.player !== piece.player) {
        // この重装兵に隣接する軽装兵の数をカウント
        const adjacentLightCount = countAdjacentLightPieces(board, targetPosition, piece.player);
        
        // 2体以上の軽装兵が隣接していれば攻撃可能
        if (adjacentLightCount >= 2) {
          attacks.push(targetPosition);
        }
      }
    }
  }
  
  return attacks;
}

/**
 * 駒の攻撃可能範囲を計算する（統合関数）
 */
export function calculatePossibleAttacks(
  board: (GamePiece | null)[][],
  piece: GamePiece
): Position[] {
  switch (piece.type) {
    case 'heavy':
      return calculateHeavyPieceAttacks(board, piece);
    case 'light':
      return calculateLightPieceCooperativeAttacks(board, piece);
    default:
      return [];
  }
}

/**
 * 指定された位置への攻撃が可能かどうかをチェックする
 */
export function isValidAttack(
  board: (GamePiece | null)[][],
  piece: GamePiece,
  targetPosition: Position
): boolean {
  const possibleAttacks = calculatePossibleAttacks(board, piece);
  return possibleAttacks.some(attack => positionsEqual(attack, targetPosition));
}