// --- 1. CONFIGURAÇÕES E VARIÁVEIS GLOBAIS ---
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

// Estados do Jogo
const state = {
    playerName: "",
    currentScreen: "screen-login"
};

let gameRunning = false;
let animationId; 
let bullets = []; 
let player; 

// Controle de Teclado
const keys = {
    ArrowRight: false,
    ArrowLeft: false,
    Space: false
};

// --- 2. CLASSES DO JOGO ---

class Player {
    constructor() {
        this.width = 40;
        this.height = 30;
        this.x = canvas.width / 2 - this.width / 2;
        this.y = canvas.height - this.height - 10;
        this.speed = 5;
        this.color = '#33ff00';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(this.x + this.width / 2, this.y); 
        ctx.lineTo(this.x + this.width, this.y + this.height);
        ctx.lineTo(this.x + this.width / 2, this.y + this.height - 10);
        ctx.lineTo(this.x, this.y + this.height);
        ctx.closePath();
        ctx.fill();
    }

    update() {
        if (keys.ArrowRight && this.x + this.width < canvas.width) {
            this.x += this.speed;
        }
        if (keys.ArrowLeft && this.x > 0) {
            this.x -= this.speed;
        }
    }

    shoot() {
        const bulletX = this.x + this.width / 2 - 2.5; 
        const bulletY = this.y;
        // CORREÇÃO AQUI: Instanciando a classe Bullet corretamente
        bullets.push(new Bullet(bulletX, bulletY));
    }
}

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 5;
        this.height = 15;
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
        if (this.y + this.height < 0) {
            this.toRemove = true;
        }
    }
}

// --- 3. GAME LOOP (MOTOR) ---

function gameLoop() {
    if (!gameRunning) return;

    // A. Limpar Tela
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // B. Atualizar Posições
    player.update();

    bullets.forEach((bullet, index) => {
        bullet.update();
        if (bullet.toRemove) {
            bullets.splice(index, 1); 
        }
    });

    // C. Desenhar Tudo
    player.draw();
    bullets.forEach(bullet => bullet.draw());

    // Loop
    animationId = requestAnimationFrame(gameLoop);
}

function startGame() {
    if (gameRunning) return; // Evita iniciar duas vezes
    gameRunning = true;
    bullets = []; 
    player = new Player(); 
    gameLoop(); 
}

function stopGame() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
}

// --- 4. INPUTS (TECLADO) ---

window.addEventListener('keydown', (e) => {
    if (e.code === 'ArrowRight') keys.ArrowRight = true;
    if (e.code === 'ArrowLeft') keys.ArrowLeft = true;
    if (e.code === 'Space') {
        if (gameRunning) player.shoot(); 
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowRight') keys.ArrowRight = false;
    if (e.code === 'ArrowLeft') keys.ArrowLeft = false;
});

// --- 5. UI E NAVEGAÇÃO ---

// Mapeamento dos elementos HTML
const screens = {
    login: document.getElementById('screen-login'),
    menu: document.getElementById('screen-menu'),
    game: document.getElementById('screen-game'),
    ranking: document.getElementById('screen-ranking')
};

const ui = {
    welcome: document.getElementById('welcome-msg'),
    rankingTitle: document.getElementById('ranking-title'),
    nameInput: document.getElementById('player-name-input')
};

// Função única de navegação
function showScreen(screenName) {
    Object.values(screens).forEach(screen => {
        screen.classList.add('hidden');
    });
    
    if (screens[screenName]) {
        screens[screenName].classList.remove('hidden');
        state.currentScreen = screenName;
    }
}

// --- 6. EVENTOS DE BOTÃO (Unificados) ---

// Botão Entrar
document.getElementById('btn-enter').addEventListener('click', () => {
    const name = ui.nameInput.value.trim();
    if (name) {
        state.playerName = name.toUpperCase();
        ui.welcome.innerText = `OLÁ, CAPITÃO ${state.playerName}`;
        showScreen('menu');
    } else {
        ui.nameInput.style.borderColor = 'red';
        setTimeout(() => ui.nameInput.style.borderColor = '#33ff00', 500);
    }
});

// Botão Jogar
document.getElementById('btn-play').addEventListener('click', () => {
    showScreen('game');
    startGame(); // Inicia o motor do jogo
});

// Botão Ranking
document.getElementById('btn-ranking').addEventListener('click', () => {
    ui.rankingTitle.innerText = "MELHORES PILOTOS";
    showScreen('ranking');
});

// Botão Voltar (do Ranking)
document.getElementById('btn-back-menu').addEventListener('click', () => {
    showScreen('menu');
});

// Botão Sair (Volta pro Login e para o jogo)
document.getElementById('btn-exit').addEventListener('click', () => {
    stopGame(); 
    state.playerName = "";
    ui.nameInput.value = "";
    showScreen('login');
});