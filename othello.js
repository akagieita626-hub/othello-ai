/**
 * オセロゲームのコアロジック
 * ボード管理、ルール判定、スコア計算
 */

class OthelloGame {
    constructor() {
        this.board = [];
        this.reset();
    }

    /**
     * ボードをリセット
     */
    reset() {
        this.board = [];
        for (let i = 0; i < 8; i++) {
            this.board[i] = new Array(8).fill(0);
        }

        // 初期配置
        this.board[3][3] = 1; // 白
        this.board[3][4] = 2; // 黒
        this.board[4][3] = 2; // 黒
        this.board[4][4] = 1; // 白
    }

    /**
     * セルの値を取得
     */
    getCell(row, col) {
        return this.board[row][col];
    }

    /**
     * 石を置く
     */
    placeStone(row, col, color) {
        if (!this.isValidMove(row, col, color)) {
            return false;
        }

        this.board[row][col] = color;
        this.flipStones(row, col, color);
        return true;
    }

    /**
     * 有効な手かどうかを判定
     */
    isValidMove(row, col, color) {
        // セルが空いているか
        if (this.board[row][col] !== 0) {
            return false;
        }

        // 相手の石を挟めるか
        const opponent = color === 1 ? 2 : 1;
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (const [dx, dy] of directions) {
            if (this.canFlip(row, col, dx, dy, color, opponent)) {
                return true;
            }
        }

        return false;
    }

    /**
     * 指定方向に相手の石を挟めるか
     */
    canFlip(row, col, dx, dy, color, opponent) {
        let r = row + dx;
        let c = col + dy;
        let count = 0;

        // 相手の石が連続しているかチェック
        while (r >= 0 && r < 8 && c >= 0 && c < 8) {
            if (this.board[r][c] === opponent) {
                count++;
            } else if (this.board[r][c] === color && count > 0) {
                return true;
            } else {
                break;
            }
            r += dx;
            c += dy;
        }

        return false;
    }

    /**
     * 石をひっくり返す
     */
    flipStones(row, col, color) {
        const opponent = color === 1 ? 2 : 1;
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [0, -1],           [0, 1],
            [1, -1],  [1, 0],  [1, 1]
        ];

        for (const [dx, dy] of directions) {
            if (this.canFlip(row, col, dx, dy, color, opponent)) {
                let r = row + dx;
                let c = col + dy;

                while (this.board[r][c] === opponent) {
                    this.board[r][c] = color;
                    r += dx;
                    c += dy;
                }
            }
        }
    }

    /**
     * 有効な手の一覧を取得
     */
    getValidMoves(color) {
        const moves = [];

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.isValidMove(row, col, color)) {
                    moves.push([row, col]);
                }
            }
        }

        return moves;
    }

    /**
     * 指定の色で有効な手があるか
     */
    hasValidMove(color) {
        return this.getValidMoves(color).length > 0;
    }

    /**
     * スコアを計算
     */
    getScore() {
        let black = 0;
        let white = 0;

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] === 1) {
                    white++;
                } else if (this.board[row][col] === 2) {
                    black++;
                }
            }
        }

        return { black, white };
    }

    /**
     * ゲームが終了したか
     */
    isGameOver() {
        return !this.hasValidMove(1) && !this.hasValidMove(2);
    }

    /**
     * ボードを評価（AIの判定用）
     */
    evaluate(aiColor) {
        const score = this.getScore();
        
        if (aiColor === 1) {
            return score.white - score.black;
        } else {
            return score.black - score.white;
        }
    }

    /**
     * ボードのクローンを作成
     */
    clone() {
        const newGame = new OthelloGame();
        newGame.board = this.board.map(row => [...row]);
        return newGame;
    }

    /**
     * ボード状態を文字列で取得（デバッグ用）
     */
    toString() {
        let str = '  0 1 2 3 4 5 6 7\n';
        for (let row = 0; row < 8; row++) {
            str += row + ' ';
            for (let col = 0; col < 8; col++) {
                const cell = this.board[row][col];
                if (cell === 0) str += '· ';
                else if (cell === 1) str += '○ ';
                else str += '● ';
            }
            str += '\n';
        }
        return str;
    }
}