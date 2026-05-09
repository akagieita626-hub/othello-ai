/**
 * ゲームコントローラー
 * UI操作とゲームロジックの連携
 */

class GameController {
    constructor() {
        this.game = new OthelloGame();
        this.ai = new OthelloAI('medium');
        this.playerColor = 2; // 黒
        this.aiColor = 1;      // 白
        this.isPlayerTurn = true;
        this.isAIThinking = false;

        this.initElements();
        this.setupEventListeners();
        this.render();
    }

    /**
     * DOM要素を取得
     */
    initElements() {
        this.boardEl = document.getElementById('board');
        this.playerScoreEl = document.getElementById('playerScore');
        this.aiScoreEl = document.getElementById('aiScore');
        this.statusEl = document.getElementById('status');
        this.turnInfoEl = document.getElementById('turnInfo');
        this.passBtn = document.getElementById('passBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.difficultySelect = document.getElementById('difficulty');
        this.validMovesEl = document.getElementById('validMoves');
    }

    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        this.passBtn.addEventListener('click', () => this.pass());
        this.resetBtn.addEventListener('click', () => this.reset());
        this.difficultySelect.addEventListener('change', (e) => {
            this.ai = new OthelloAI(e.target.value);
        });
    }

    /**
     * ボードをレンダリング
     */
    render() {
        this.renderBoard();
        this.updateScore();
        this.updateStatus();
    }

    /**
     * ボードのセルをレンダリング
     */
    renderBoard() {
        this.boardEl.innerHTML = '';

        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('button');
                cell.className = 'cell';
                cell.id = `cell-${row}-${col}`;
                cell.disabled = this.isAIThinking;

                const stoneValue = this.game.getCell(row, col);

                // 石を追加
                if (stoneValue !== 0) {
                    const stone = document.createElement('div');
                    stone.className = `stone ${stoneValue === 1 ? 'white' : 'black'}`;
                    cell.appendChild(stone);
                    cell.classList.add('disabled');
                }

                // プレイヤーターンの場合、有効な手を表示
                if (this.isPlayerTurn && !this.isAIThinking) {
                    if (this.game.isValidMove(row, col, this.playerColor)) {
                        cell.classList.add('valid-move');
                        cell.addEventListener('click', () => this.playerMove(row, col));
                    }
                }

                this.boardEl.appendChild(cell);
            }
        }
    }

    /**
     * プレイヤーが石を置く
     */
    playerMove(row, col) {
        if (!this.isPlayerTurn || this.isAIThinking) return;

        if (this.game.placeStone(row, col, this.playerColor)) {
            this.render();
            this.isPlayerTurn = false;

            // AIのターン
            setTimeout(() => this.aiMove(), 800);
        }
    }

    /**
     * AIが手を選択して実行
     */
    aiMove() {
        this.isAIThinking = true;
        this.updateStatus();

        // AIの思考時間を少し設ける
        setTimeout(() => {
            // AIが置ける場所があるか確認
            if (!this.game.hasValidMove(this.aiColor)) {
                // AIが置ける場所がない
                if (!this.game.hasValidMove(this.playerColor)) {
                    // プレイヤーも置ける場所がない = ゲーム終了
                    this.endGame();
                } else {
                    // プレイヤーのターン
                    this.isPlayerTurn = true;
                    this.isAIThinking = false;
                    this.render();
                }
                return;
            }

            // AIが手を選択
            const move = this.ai.getMove(this.game, this.aiColor);

            if (move) {
                this.game.placeStone(move[0], move[1], this.aiColor);
                this.render();

                // プレイヤーが置ける場所があるか確認
                if (this.game.hasValidMove(this.playerColor)) {
                    this.isPlayerTurn = true;
                } else if (this.game.hasValidMove(this.aiColor)) {
                    // AIがもう一度置く
                    setTimeout(() => this.aiMove(), 800);
                    return;
                } else {
                    // ゲーム終了
                    this.endGame();
                }
            }

            this.isAIThinking = false;
            this.render();
        }, 500);
    }

    /**
     * パスボタンが押された
     */
    pass() {
        if (!this.isPlayerTurn) return;

        // プレイヤーが置ける場所があるかチェック
        if (this.game.hasValidMove(this.playerColor)) {
            alert('置ける場所があります！');
            return;
        }

        this.isPlayerTurn = false;
        this.render();

        // AIのターン
        setTimeout(() => this.aiMove(), 800);
    }

    /**
     * ゲームをリセット
     */
    reset() {
        this.game.reset();
        this.isPlayerTurn = true;
        this.isAIThinking = false;
        this.render();
    }

    /**
     * スコアを更新
     */
    updateScore() {
        const score = this.game.getScore();
        this.playerScoreEl.textContent = score.black;
        this.aiScoreEl.textContent = score.white;

        // 有効な手の数を表示
        const validMoves = this.game.getValidMoves(this.playerColor).length;
        this.validMovesEl.textContent = validMoves;
    }

    /**
     * ゲーム状態を更新
     */
    updateStatus() {
        let status = '';
        let turn = '';

        if (this.isAIThinking) {
            status = '🤔 AIが考え中...';
            turn = 'AIのターンです';
        } else if (this.game.isGameOver()) {
            const score = this.game.getScore();
            if (score.black > score.white) {
                status = '🎉 あなたが勝ちました！';
            } else if (score.white > score.black) {
                status = '😔 AIが勝ちました';
            } else {
                status = '🤝 同点です';
            }
            turn = `最終スコア: あなた ${score.black} vs AI ${score.white}`;
        } else if (this.isPlayerTurn) {
            status = 'ゲーム中';
            turn = '✅ あなたの番です';
        } else {
            status = 'ゲーム中';
            turn = 'AIのターンです';
        }

        this.statusEl.textContent = status;
        this.turnInfoEl.textContent = turn;
        this.passBtn.disabled = this.isAIThinking || !this.isPlayerTurn;
    }

    /**
     * ゲーム終了処理
     */
    endGame() {
        const score = this.game.getScore();
        let message = '';

        if (score.black > score.white) {
            message = `🎉 おめでとう！あなたの勝ち！\nスコア: あなた ${score.black} - AI ${score.white}`;
        } else if (score.white > score.black) {
            message = `😔 AIが勝ちました\nスコア: あなた ${score.black} - AI ${score.white}`;
        } else {
            message = `🤝 同点です！\nスコア: ${score.black} - ${score.white}`;
        }

        this.isPlayerTurn = false;
        this.isAIThinking = false;
        this.render();

        // 少し待ってからアラート表示
        setTimeout(() => {
            alert(message);
        }, 500);
    }
}

// ゲーム起動
document.addEventListener('DOMContentLoaded', () => {
    new GameController();
});