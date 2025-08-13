// 基本型定義
export type PieceType = 'heavy' | 'light';
export type Player = 'player1' | 'player2';

export interface Position {
  row: number;
  col: number;
}

// 駒の定義
export interface GamePiece {
  id: string;
  type: PieceType;
  player: Player;
  position: Position;
}

// ゲーム状態
export interface GameState {
  board: (GamePiece | null)[][];
  currentPlayer: Player;
  selectedPiece: GamePiece | null;
  possibleMoves: Position[];
  possibleAttacks: Position[];
  gamePhase: 'playing' | 'gameOver';
  winner: Player | null;
  lightPiecesMovedThisTurn: number;
}

// アクション定義
export type GameAction = 
  | { type: 'SELECT_PIECE'; piece: GamePiece }
  | { type: 'MOVE_PIECE'; from: Position; to: Position }
  | { type: 'ATTACK_PIECE'; attacker: Position; target: Position }
  | { type: 'END_TURN' }
  | { type: 'NEW_GAME' }
  | { type: 'NEW_GAME_WITH_OPTIONS'; options?: { startingPlayer?: Player } };
