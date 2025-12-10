// --- 1. CONFIGURAÇÕES E VARIÁVEIS GLOBAIS ---
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// --- ASSETS (IMAGENS E SONS) ---
const sprites = {
    player: new Image(),
    alien1: new Image(), // Alien green
    alien2: new Image(), // Alien yellow
    alien3: new Image(), // Alien red
    ufo: new Image()     // Nave Especial
};

// Certifique-se que estes arquivos existem na pasta assets
sprites.player.src = 'assets/player.png';
sprites.alien1.src = 'assets/green.png';
sprites.alien2.src = 'assets/yellow.png';
sprites.alien3.src = 'assets/red.png';
sprites.ufo.src    = 'assets/ufo.png';

const sounds = {
    bgMusic:       new Audio('assets/sound-effects/background-music/spaceinvaders.mpeg'),
    shoot:         new Audio('assets/sound-effects/shoot.wav'),
    explosion:     new Audio('assets/sound-effects/explosion.wav'),
    invaderKilled: new Audio('assets/sound-effects/invaderkilled.wav'),
    fastInvader:   new Audio('assets/sound-effects/fastinvader.wav')
};

sounds.bgMusic.loop = true;
sounds.bgMusic.volume = 0.3;

function playSound(soundName) {
    const sound = sounds[soundName];
    if (sound) {
        sound.currentTime = 0;
        sound.play().catch(e => console.log("Erro som:", e));
    }
}

// --- VARIÁVEIS DE ESTADO ---
const state = {
    currentUser: null,
    currentScreen: "screen-login"
};

const DB_KEY = "space_invaders_db_v1";

// Variáveis do Jogo
let gameRunning = false;
let isPaused = false;
let animationId;
let bullets = [];
let enemyBullets = [];
let player;
let enemies = [];
let ufo;

// Variáveis de Controle de Gameplay
let currentScore = 0;
let startTime = 0;
let level = 1;
let baseEnemySpeed = 2;
let enemyDirection = 1; // 1 = Direita, -1 = Esquerda

// Controle de Teclado
const keys = { ArrowRight: false, ArrowLeft: false, Space: false };


// --- 2. SISTEMA DE DADOS (LOCAL STORAGE) ---

function getDB() {
    const data = localStorage.getItem(DB_KEY);
    return data ? JSON.parse(data) : {};
}

function saveDB(data) {
    localStorage.setItem(DB_KEY, JSON.stringify(data));
}

function validatePassword(password) {
    const regex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{6,14}$/;
    return regex.test(password);
}


// --- 3. CLASSES DO JOGO ---

class Player {
    constructor() {
        this.width = 40;
        this.height = 30;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 10;
        this.speed = 5;
    }

    draw() {
        if (sprites.player.complete && sprites.player.naturalWidth !== 0) {
            ctx.drawImage(sprites.player, this.x, this.y, this.width, this.height);
        } else {
            // Fallback: Quadrado Verde Neon se imagem falhar
            ctx.fillStyle = '#33ff00';
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    update() {
        if (keys.ArrowRight && this.x + this.width < canvas.width) this.x += this.speed;
        if (keys.ArrowLeft && this.x > 0) this.x -= this.speed;
    }

    shoot() {
        const bulletX = this.x + this.width / 2 - 2;
        const bulletY = this.y;
        bullets.push(new Bullet(bulletX, bulletY));
        playSound('shoot');
    }
}

class Alien {
    constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 30; // Ajustado proporção
        this.type = type;
    }

    draw() {
        let spriteToUse;
        // 3=Red, 2=Yellow, 1=Green
        if (this.type === 3) spriteToUse = sprites.alien3;
        else if (this.type === 2) spriteToUse = sprites.alien2;
        else spriteToUse = sprites.alien1;

        if (spriteToUse.complete && spriteToUse.naturalWidth !== 0) {
            ctx.drawImage(spriteToUse, this.x, this.y, this.width, this.height);
        } else {
            // Fallback colorido
            ctx.fillStyle = this.type === 3 ? 'red' : (this.type === 2 ? 'yellow' : '#33ff00');
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }
}

class Ufo {
    constructor() {
        this.width = 60;
        this.height = 30;
        this.x = -100;
        this.y = 40; // Um pouco abaixo do topo absoluto
        this.speed = 4;
        this.active = false;
        this.direction = 1;
    }

    draw() {
        if (!this.active) return;
        if (sprites.ufo.complete && sprites.ufo.naturalWidth !== 0) {
            ctx.drawImage(sprites.ufo, this.x, this.y, this.width, this.height);
        } else {
            ctx.fillStyle = '#ff00ff'; // Roxo
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }
    }

    update() {
        if (!this.active) return;
        this.x += this.speed * this.direction;

        if (this.direction === 1 && this.x > canvas.width) this.active = false;
        else if (this.direction === -1 && this.x + this.width < 0) this.active = false;
    }

    spawn() {
        if (this.active) return;
        this.active = true;
        if (Math.random() < 0.5) {
            this.x = -this.width;
            this.direction = 1;
        } else {
            this.x = canvas.width;
            this.direction = -1;
        }
    }
}

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 10;
        this.speed = 7;
        this.color = '#fff';
        this.toRemove = false;
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y -= this.speed;
        if (this.y + this.height < 0) this.toRemove = true;
    }
}

class EnemyBullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 4;
        this.height = 10;
        this.speed = 4; 
        this.toRemove = false;
    }

    draw() {
        ctx.fillStyle = '#ff0000'; // Vermelho
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    update() {
        this.y += this.speed; // Vai para BAIXO
        if (this.y > canvas.height) {
            this.toRemove = true;
        }
    }
}


// --- 4. FUNÇÕES DE CRIAÇÃO (FALTAVA ISSO NO SEU CÓDIGO) ---

function createEnemies() {
    enemies = [];
    const rows = 5;
    const cols = 8;
    const padding = 15;
    const offsetTop = 60; // Espaço para o UFO passar em cima
    const offsetLeft = 50;

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const x = offsetLeft + c * (40 + padding);
            const y = offsetTop + r * (30 + padding);

            // Define tipo: Linha 0=Red(3), 1-2=Yellow(2), 3-4=Green(1)
            let type = 1;
            if (r === 0) type = 3;
            else if (r === 1 || r === 2) type = 2;

            enemies.push(new Alien(x, y, type));
        }
    }
}

// Função de Colisão
function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}


// --- 5. GAME LOOP ---

function gameLoop() {
    if (!gameRunning) return;

    // A. Limpar e Desenhar Fundo
    drawBackground();
   

    // B. HUD
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById('score-val').textContent = currentScore;
    document.getElementById('time-val').textContent = elapsed + "s";

    // C. Player
    player.update();
    player.draw();

    // D. UFO
    if (!ufo.active && Math.random() < 0.001) ufo.spawn();
    ufo.update();
    ufo.draw();

    // Colisão Bala x UFO
    bullets.forEach((bullet) => {
        if (ufo.active && checkCollision(bullet, ufo)) {
            playSound('explosion');
            ufo.active = false;
            bullet.toRemove = true;
            currentScore += Math.floor(Math.random() * 401) + 100;
        }
    });

    // E. Balas
    bullets.forEach((bullet, index) => {
        bullet.update();
        if (bullet.toRemove) bullets.splice(index, 1);
        else bullet.draw();
    });

    // F. Tiros dos Inimigos
    // 1. Chance de criar novo tiro (Aumenta com o nível)
    const shootChance = 0.01 + (level * 0.005); 
    
    if (enemies.length > 0 && Math.random() < shootChance) {
        // Escolhe um alien aleatório para atirar
        const shooter = enemies[Math.floor(Math.random() * enemies.length)];
        // Cria a bala na posição desse alien
        enemyBullets.push(new EnemyBullet(shooter.x + shooter.width/2, shooter.y + shooter.height));
    }

    // 2. Atualizar e Desenhar Tiros Inimigos
    enemyBullets.forEach((bullet, index) => {
        bullet.update();
        bullet.draw(); // <--- Desenha o tiro vermelho

        // Remove se sair da tela
        if (bullet.toRemove) {
            enemyBullets.splice(index, 1);
        } 
        // Checa se acertou o Player (GAME OVER)
        else if (checkCollision(bullet, player)) {
            gameOver();
            return;
        }
    });

    // G. Inimigos
    let hitEdge = false;
    
    // Loop reverso para remoção segura
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        let enemyHit = false;

        // Desenhar Inimigo
        enemy.draw();

        // Colisão Bala x Alien
        for (let j = bullets.length - 1; j >= 0; j--) {
            const bullet = bullets[j];
            if (checkCollision(bullet, enemy)) {
                playSound('invaderKilled');
                if (enemy.type === 3) currentScore += 30;
                else if (enemy.type === 2) currentScore += 20;
                else currentScore += 10;
                
                bullets.splice(j, 1); // Remove bala
                enemyHit = true;
                break;
            }
        }

        if (enemyHit) {
            enemies.splice(i, 1); // Remove alien
            continue;
        }

        // Movimento
        if (enemyDirection === 1 && (enemy.x + enemy.width) >= canvas.width) hitEdge = true;
        else if (enemyDirection === -1 && enemy.x <= 0) hitEdge = true;

        enemy.x += (baseEnemySpeed + (level * 0.5)) * enemyDirection;

        // Game Over
        if (checkCollision(enemy, player) || (enemy.y + enemy.height) >= canvas.height) {
            gameOver();
            return;
        }
    }

    // H. Horda desce
    if (hitEdge) {
        enemyDirection *= -1;
        enemies.forEach(e => e.y += 20);
    }

    // I. Próxima Fase
    if (enemies.length === 0) levelUp();

    animationId = requestAnimationFrame(gameLoop);
}

// --- 5.1 BACKGROUND ---
const stars = [];
for (let i = 0; i < 100; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2,
        speed: Math.random() * 0.5
    });
}

function drawBackground() {
    ctx.fillStyle = '#000'; // Fundo preto
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#ffffff';
    stars.forEach(star => {
        ctx.fillRect(star.x, star.y, star.size, star.size);
        // Pequeno movimento
        star.y += star.speed;
        if (star.y > canvas.height) star.y = 0;
    });
}


// --- 6. CONTROLE DE FLUXO ---

function startGame() {
    if (gameRunning) return;

    sounds.bgMusic.currentTime = 0;
    sounds.bgMusic.play().catch(e => console.log("Autoplay bloqueado pelo navegador"));

    gameRunning = true;
    isPaused = false;
    document.getElementById('btn-pause').innerText = "PAUSE";
    currentScore = 0;
    level = 1;
    startTime = Date.now();
    baseEnemySpeed = 2;
    enemyDirection = 1;

    bullets = [];
    enemyBullets = [];
    player = new Player();
    createEnemies(); // <--- AGORA ESSA FUNÇÃO EXISTE
    ufo = new Ufo();

    gameLoop();
}

function togglePause() {
    if (!gameRunning) return; // Só pausa se o jogo estiver rodando

    isPaused = !isPaused; // Inverte o estado (True <-> False)

    if (isPaused) {
        // --- ENTROU EM PAUSE ---
        cancelAnimationFrame(animationId); // Para o loop do jogo
        sounds.bgMusic.pause(); // Pausa a música
        
        // Desenha "PAUSED" na tela sobre o jogo parado
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Fundo semi-transparente
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#fff';
        ctx.font = '30px "Press Start 2P", cursive';
        ctx.textAlign = 'center';
        ctx.fillText("PAUSE", canvas.width / 2, canvas.height / 2);
        ctx.textAlign = 'start'; // Reseta alinhamento
        
        // Muda texto do botão
        document.getElementById('btn-pause').innerText = "RESUME";

    } else {
        // --- SAIU DO PAUSE (RETOMAR) ---
        sounds.bgMusic.play().catch(e => console.log("Erro som resume"));
        document.getElementById('btn-pause').innerText = "PAUSE";
        gameLoop(); // Reinicia o loop
    }  
}


function stopGame() {
    gameRunning = false;
    sounds.bgMusic.pause();
    cancelAnimationFrame(animationId);
}

function levelUp() {
    level++;
    playSound('fastInvader');
    createEnemies();
    bullets = [];
    enemyBullets = [];
    currentScore += 100;
}

function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    sounds.bgMusic.pause();
    playSound('explosion');

    const finalTime = Math.floor((Date.now() - startTime) / 1000);
    alert(`GAME OVER!\nScore: ${currentScore}\nNível: ${level}`);
    
    saveScoreToRanking(currentScore, finalTime);
    updateRankingTable();
    showScreen('ranking');
}

function saveScoreToRanking(score, timeSeconds) {
    if (!state.currentUser) return;
    const db = getDB();
    const user = db[state.currentUser.name];

    if (score > user.highScore) {
        user.highScore = score;
        db[state.currentUser.name] = user;
        saveDB(db);
    }
}


// --- 7. INPUTS E INTERFACE ---

window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowRight') keys.ArrowRight = true;
    if (e.code === 'ArrowLeft') keys.ArrowLeft = true;
    if (e.code === 'Space') {
        if (gameRunning && !e.repeat) player.shoot();
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowRight') keys.ArrowRight = false;
    if (e.code === 'ArrowLeft') keys.ArrowLeft = false;
});

const screens = {
    login: document.getElementById('screen-login'),
    menu: document.getElementById('screen-menu'),
    game: document.getElementById('screen-game'),
    ranking: document.getElementById('screen-ranking')
};

const ui = {
    username: document.getElementById('username'),
    password: document.getElementById('password'),
    msg: document.getElementById('login-message'),
    welcome: document.getElementById('welcome-msg'),
    rankingList: document.getElementById('ranking-list')
};

function showScreen(screenName) {
    Object.values(screens).forEach(s => s.classList.add('hidden'));
    screens[screenName].classList.remove('hidden');
    state.currentScreen = screenName;
    ui.msg.classList.add('hidden');
}

function showMessage(text, type) {
    ui.msg.textContent = text;
    ui.msg.className = `message ${type}`;
    ui.msg.classList.remove('hidden');
}

document.getElementById('btn-login-action').addEventListener('click', () => {
    const user = ui.username.value.trim().toUpperCase();
    const pass = ui.password.value.trim();
    const db = getDB();

    if (!user || !pass) return showMessage("Preencha todos os campos.", "error");

    if (db[user]) {
        if (db[user].password === pass) {
            state.currentUser = db[user];
            ui.welcome.innerText = `PILOTO: ${state.currentUser.name}`;
            showScreen('menu');
        } else {
            showMessage("Senha incorreta.", "error");
        }
    } else {
        showMessage("Usuário não encontrado.", "error");
    }
});

document.getElementById('btn-cadastrar-action').addEventListener('click', () => {
    const user = ui.username.value.trim().toUpperCase();
    const pass = ui.password.value.trim();
    const db = getDB();

    if (!user || !pass) return showMessage("Preencha todos os campos.", "error");
    if (db[user]) return showMessage("Usuário já existe!", "error");
    if (!validatePassword(pass)) return showMessage("Senha fraca!", "error");

    db[user] = { name: user, password: pass, highScore: 0 };
    saveDB(db);
    showMessage("Cadastro realizado! Faça Login.", "success");
    ui.password.value = "";
});

document.getElementById('btn-play').addEventListener('click', () => {
    showScreen('game');
    startGame();
});

document.getElementById('btn-ranking').addEventListener('click', () => {
    updateRankingTable();
    showScreen('ranking');
});

document.getElementById('btn-back-menu').addEventListener('click', () => showScreen('menu'));

document.getElementById('btn-exit').addEventListener('click', () => {
    stopGame();
    state.currentUser = null;
    ui.username.value = "";
    ui.password.value = "";
    showScreen('login');
});

// 1. Evento de Clique no botão da tela
document.getElementById('btn-pause').addEventListener('click', () => {
    togglePause(); // Ao clicar, pausa ou retoma
    // Tira o foco do botão para que o Enter/Espaço não reative o botão acidentalmente
    document.getElementById('btn-pause').blur(); 
});

// 2. Atualize o Evento de Teclado (keydown) existente
window.addEventListener('keydown', (e) => {
    // Tecla P ou ESC para pausar
    if (e.code === 'KeyP' || e.code === 'Escape') {
        togglePause();
    }

    // Só permite mover se NÃO estiver pausado
    if (!isPaused) { 
        if (e.code === 'ArrowRight') keys.ArrowRight = true;
        if (e.code === 'ArrowLeft') keys.ArrowLeft = true;
        if (e.code === 'Space') {
            if (gameRunning && !e.repeat) player.shoot();
        }
    }
});

// 3. Atualize o Evento de Teclado (keyup)
window.addEventListener('keyup', (e) => {
    if (!isPaused) {
        if (e.code === 'ArrowRight') keys.ArrowRight = false;
        if (e.code === 'ArrowLeft') keys.ArrowLeft = false;
    }
});

function updateRankingTable() {
    const db = getDB();
    const sortedPlayers = Object.values(db)
        .sort((a, b) => b.highScore - a.highScore)
        .slice(0, 5);

    ui.rankingList.innerHTML = sortedPlayers.map((p, i) => `
        <tr>
            <td>${i+1}. ${p.name}</td>
            <td>${p.highScore}</td>
        </tr>
    `).join('');
}