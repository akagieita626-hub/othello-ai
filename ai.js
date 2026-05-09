/**
 * オセロAI
 * ミニマックスアルゴリズムを使用した知的なAI
 */

class OthelloAI {
    constructor(difficulty = 'medium') {
        this.difficulty = difficulty;
        this.depths = {
            easy: 2,
            medium: 4,
            hard: 6
        };
        this.depth = this.depths[difficulty] || 4;
        this.maxDepth = this.depth;
    }

    /**
     * AIが最適な手を選択
     */
    getMove(game, aiColor) {
        const validMoves = game.getValidMoves(aiColor);

        if (validMoves.length === 0) {
            return null;
        }

        if (validMoves.length === 1) {
            return validMoves[0];
        }

        // ミニマックスアルゴリズムで最適な手を探す
        let bestMove = validMoves[0];
        let bestScore = -Infinity;

        for (const move of validMoves) {
            const newGame = game.clone();
            newGame.placeStone(move[0], move[1], aiColor);

            const playerColor = aiColor === 1 ? 2 : 1;
            const score = this.minimax(newGame, this.depth - 1, -Infinity, Infinity, false, aiColor, playerColor);

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }

        return bestMove;
    }

    /**
     * ミニマックスアルゴリズム（アルファベータ枝刈り付き）
     */
    minimax(game, depth, alpha, beta, isMaximizing, aiColor, playerColor) {
        // 終了条件
        if (depth === 0 || game.isGameOver()) {
            return game.evaluate(aiColor);
        }

        const color = isMaximizing ? aiColor : playerColor;
        const validMoves = game.getValidMoves(color);

        if (validMoves.length === 0) {
            // パスする場合
            const otherColor = color === aiColor ? playerColor : aiColor;
            if (game.hasValidMove(otherColor)) {
                return this.minimax(game, depth - 1, alpha, beta, !isMaximizing, aiColor, playerColor);
            } else {
                // 両方ともパスできない = ゲーム終了
                return game.evaluate(aiColor);
            }
        }

        if (isMaximizing) {
            let maxEval = -Infinity;

            for (const move of validMoves) {
                const newGame = game.clone();
                newGame.placeStone(move[0], move[1], aiColor);

                const eval_ = this.minimax(newGame, depth - 1, alpha, beta, false, aiColor, playerColor);
                maxEval = Math.max(maxEval, eval_);
                alpha = Math.max(alpha, eval_);

                if (beta <= alpha) break; // ベータ枝刈り
            }

            return maxEval;
        } else {
            let minEval = Infinity;

            for (const move of validMoves) {
                const newGame = game.clone();
                newGame.placeStone(move[0], move[1], playerColor);

                const eval_ = this.minimax(newGame, depth - 1, alpha, beta, true, aiColor, playerColor);
                minEval = Math.min(minEval, eval_);
                beta = Math.min(beta, eval_);

                if (beta <= alpha) break; // アルファ枝刈り
            }

            return minEval;
        }
    }

    /**
     * 難易度を変更
     */
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        this.depth = this.depths[difficulty] || 4;
        this.maxDepth = this.depth;
    }
}