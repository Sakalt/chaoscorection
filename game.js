const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth * 0.8; // モバイル対応のために幅を調整
canvas.height = window.innerHeight * 0.6;

// 音声ファイルのロード
const defeatSound = new Audio('assets/square.wav'); // 音声ファイルのパスを設定

let coins = 100;
let enemies = [];
let characters = [];
let characterData;
let availableCharacters = [];

// キャラクターデータのロード
fetch('characters.json')
    .then(response => response.json())
    .then(data => {
        characterData = data;
        initializeGame();
    });

function initializeGame() {
    loadSavedData(); // ローカルストレージからデータを読み込み
    requestAnimationFrame(gameLoop);
}

function loadSavedData() {
    const savedCoins = localStorage.getItem('coins');
    if (savedCoins) coins = parseInt(savedCoins);

    const unlockedCharacters = localStorage.getItem('unlockedCharacters');
    if (unlockedCharacters) availableCharacters = JSON.parse(unlockedCharacters);
}

// コインを更新
function updateCoins(amount) {
    coins += amount;
    localStorage.setItem('coins', coins);
}

// キャラクタークラス
class Character {
    constructor(name, x, y) {
        this.name = name;
        this.x = x;
        this.y = y;
        this.hp = 100;
    }

    draw() {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, 50, 50);
        ctx.fillStyle = 'white';
        ctx.fillText(this.name, this.x + 5, this.y + 30);
    }

    useSkill(skillName) {
        if (skillName === 'YouAreIdiot') {
            this.summonWindows();
        } else if (skillName === 'ScratchCat') {
            this.distractEnemy();
        }
    }

    summonWindows() {
        if (coins >= 10) {
            updateCoins(-10);
            for (let i = 0; i < 10; i++) {
                setTimeout(() => {
                    ctx.fillStyle = 'red';
                    ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 100, 50);
                    ctx.fillStyle = 'white';
                    ctx.fillText('You are idiot!', Math.random() * canvas.width + 10, Math.random() * canvas.height + 30);
                }, i * 500);
            }
        }
    }

    distractEnemy() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.draw();
    }
}

// 敵クラス
class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.hp = 50;
    }

    draw() {
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y, 50, 50);
    }

    update() {
        this.x -= 1;
        if (this.x < 0) this.x = canvas.width;
    }
}

// 敵を倒す処理
function defeatEnemy(enemy) {
    updateCoins(5); // コインを5枚獲得
    defeatSound.play(); // 敵を倒したときに音を再生
    enemies.splice(enemies.indexOf(enemy), 1); // 敵を削除
}

// 敵の生成
document.getElementById('spawnEnemyButton').addEventListener('click', () => {
    const spawnEnemy = () => {
        enemies.push(new Enemy(canvas.width, Math.random() * canvas.height));
        if (enemies.length < 10) {
            setTimeout(spawnEnemy, 10000); // 10秒ごとに2体の敵を生成
        }
    };
    spawnEnemy();
});

// ゲームループ
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 画面をクリア

    characters.forEach(character => character.draw());
    enemies.forEach(enemy => {
        enemy.update();
        enemy.draw();
    });

    requestAnimationFrame(gameLoop);
}
