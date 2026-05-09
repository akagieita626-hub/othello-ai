/**
 * ゲームコントローラー - AI対戦と人間対戦の両対応
 * UI操作とゲームロジックの連携
 */

class GameController {
    constructor(mode = 'ai') {
        this.gameMode = mode; // 'ai' または 'human'
        this.game = new OthelloGame();
        this.ai = new OthelloAI('medium');
        
        // AI対戦モード
        this.playerColor = 2; // 黒
        this.aiColor = 1;      // 白
        
        // 人間対戦モード
        this.player1Color = 2; // 黒
        this.player2Color = 1; // 白
        this.currentPlayerColor = 2; // 現在のプレイヤー
        
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
        this.player1ScoreEl = document.getElementById('player1Score');
        this.player2ScoreEl = document.getElementById('player2Score');
        this.statusEl = document.getElementById('status');
        this.turnInfoEl = document.getElementById('turnInfo');
        this.passBtn = document.getElementById('passBtn');
        this.resetBtn = document.getElementById('resetBtn');
        this.modeSelect = document.getElementById('modeSelect');
        this.difficultySelect = document.getElementById('difficulty');
        this.validMovesEl = document.getElementById('validMoves');
        this.difficultyContainer = document.getElementById('difficultyContainer');
    }

    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        this.passBtn.addEventListener('click', () => this.pass());
        this.resetBtn.addEventListener('click', () => this.resetGame());
        
        if (this.modeSelect) {
            this.modeSelect.addEventListener('change', (e) => {
                this.switchMode(e.target.value);
            });
        }
        
        if (this.difficultySelect) {
            this.difficultySelect.addEventListener('change', (e) => {
                this.ai = new OthelloAI(e.target.value);
            });
        }
    }

    /**
     * ゲームモードを切り替え
     */
    switchMode(mode) {
        this.gameMode = mode;
        if (this.difficultyContainer) {
            this.difficultyContainer.style.display = mode === 'ai' ? 'block' : 'none';
        }
        this.resetGame();
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
                    const colorToCheck = this.gameMode === 'ai' ? this.playerColor : this.currentPlayerColor;
                    if (this.game.isValidMove(row, col, colorToCheck)) {
                        cell.classList.add('valid-move');
                        cell.addEventListener('click', () => this.playerMove(row, col));
                    }
                }

                cell.disabled = this.isAIThinking;
                this.boardEl.appendChild(cell);
            }
        }
    }

    /**
     * プレイヤーが石を置く
     */
    playerMove(row, col) {
        if (!this.isPlayerTurn || this.isAIThinking) return;

        const colorToUse = this.gameMode === 'ai' ? this.playerColor : this.currentPlayerColor;

        if (this.game.placeStone(row, col, colorToUse)) {
            this.render();

            if (this.gameMode === 'ai') {
                // AI対戦モード
                this.isPlayerTurn = false;
                setTimeout(() => this.aiMove(), 800);
            } else {
                // 人間対戦モード
                this.currentPlayerColor = this.currentPlayerColor === 1 ? 2 : 1;
                this.handleNextTurn();
            }
        }
    }

    /**
     * 次のターンを処理（人間対戦用）
     */
    handleNextTurn() {
        // 現在のプレイヤーが置ける場所があるか確認
        if (this.game.hasValidMove(this.currentPlayerColor)) {
            this.isPlayerTurn = true;
            this.render();
        } else {
            // 置ける場所がない場合、相手をチェック
            const otherColor = this.currentPlayerColor === 1 ? 2 : 1;
            if (this.game.hasValidMove(otherColor)) {
                // 相手が置ける場所がある
                this.currentPlayerColor = otherColor;
                this.isPlayerTurn = true;
                this.render();
            } else {
                // ゲーム終了
                this.endGame();
            }
        }
    }

    /**
     * AIが手を選択して実行
     */
    aiMove() {
        this.isAIThinking = true;
        this.updateStatus();

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
        if (!this.isPlayerTurn || this.isAIThinking) return;

        const colorToCheck = this.gameMode === 'ai' ? this.playerColor : this.currentPlayerColor;

        // プレイヤーが置ける場所があるかチェック
        if (this.game.hasValidMove(colorToCheck)) {
            alert('置ける場所があります！');
            return;
        }

        if (this.gameMode === 'ai') {
            this.isPlayerTurn = false;
            setTimeout(() => this.aiMove(), 800);
        } else {
            // 人間対戦モード
            this.currentPlayerColor = this.currentPlayerColor === 1 ? 2 : 1;
            this.handleNextTurn();
        }
    }

    /**
     * ゲームをリセット
     */
    resetGame() {
        this.game.reset();
        this.isPlayerTurn = true;
        this.isAIThinking = false;
        this.currentPlayerColor = 2; // 黒から開始
        this.render();
    }

    /**
     * スコアを更新
     */
    updateScore() {
        const score = this.game.getScore();
        
        if (this.gameMode === 'ai') {
            this.player1ScoreEl.textContent = score.black;
            this.player2ScoreEl.textContent = score.white;
        } else {
            this.player1ScoreEl.textContent = score.black;
            this.player2ScoreEl.textContent = score.white;
        }

        // 有効な手の数を表示
        const colorToCheck = this.gameMode === 'ai' ? this.playerColor : this.currentPlayerColor;
        const validMoves = this.game.getValidMoves(colorToCheck).length;
        this.validMovesEl.textContent = validMoves;
    }

    /**
     * ゲーム状態を更新
     */
    updateStatus() {
        let status = '';
        let turn = '';

        if (this.gameMode === 'ai') {
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
                turn = '✅ あなた（黒）の番です';
            } else {
                status = 'ゲーム中';
                turn = 'AIのターンです';
            }
        } else {
            // 人間対戦モード
            if (this.game.isGameOver()) {
                const score = this.game.getScore();
                if (score.black > score.white) {
                    status = '🎉 プレイヤー1（黒）が勝ちました！';
                } else if (score.white > score.black) {
                    status = '🎉 プレイヤー2（白）が勝ちました！';
                } else {
                    status = '🤝 同点です';
                }
                turn = `最終スコア: 黒 ${score.black} - 白 ${score.white}`;
            } else if (this.isPlayerTurn) {
                status = 'ゲーム中';
                const playerName = this.currentPlayerColor === 2 ? 'プレイヤー1（黒）' : 'プレイヤー2（白）';
                turn = `✅ ${playerName}の番です`;
            }
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

        if (this.gameMode === 'ai') {
            if (score.black > score.white) {
                message = `🎉 おめでとう！あなたの勝ち！\nスコア: あなた ${score.black} - AI ${score.white}`;
            } else if (score.white > score.black) {
                message = `😔 AIが勝ちました\nスコア: あなた ${score.black} - AI ${score.white}`;
            } else {
                message = `🤝 同点です！\nスコア: ${score.black} - ${score.white}`;
            }
        } else {
            if (score.black > score.white) {
                message = `🎉 プレイヤー1（黒）が勝ちました！\nスコア: 黒 ${score.black} - 白 ${score.white}`;
            } else if (score.white > score.black) {
                message = `🎉 プレイヤー2（白）が勝ちました！\nスコア: 黒 ${score.black} - 白 ${score.white}`;
            } else {
                message = `🤝 同点です！\nスコア: ${score.black} - ${score.white}`;
            }
        }

        this.isPlayerTurn = false;
        this.isAIThinking = false;
        this.render();

        setTimeout(() => {
            alert(message);
        }, 500);
    }
}

// ゲーム起動
document.addEventListener('DOMContentLoaded', () => {
    const modeSelect = document.getElementById('modeSelect');
    const initialMode = modeSelect ? modeSelect.value : 'ai';
    window.gameController = new GameController(initialMode);
});