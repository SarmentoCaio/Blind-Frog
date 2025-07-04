// === VARIÁVEIS E IMAGENS ===
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const heartsContainer = document.getElementById('hearts');

// Elementos do jogo
const frog = { x: 50, y: 300, width: 64, height: 64, speed: 8 };
const oliveira = { x: 400, y: 300, width: 80, height: 80, speed: 3 };
const perereca = { x: 200, y: 100, width: 48, height: 48, speed: 8 };

// Sistema de vidas e mensagem
let lives = 3;
let frogFacingRight = true;
let showScaredMessage = false;
let scaredMessageTimer = 0;
const scaredMessageDuration = 60; // Duração em frames (~1 segundo em 60fps)

// Estados do jogo
let keys = {};
let gameOver = false;
let gameStarted = false;

// Animação do sapo
const frogImgs = [
    new Image(), new Image(), new Image(), new Image()
];
frogImgs[0].src = 'assets/animations/frog_blind1.png';
frogImgs[1].src = 'assets/animations/frog_blind2.png';
frogImgs[2].src = 'assets/animations/frog_blind3.png';
frogImgs[3].src = 'assets/animations/frog_blind4.png';

let frogFrameIndex = 0;
let frogFrameDelay = 0;
const frogFrameSpeed = 8;

// Animação da perereca
const pererecaImgs = [
    new Image(), new Image(), new Image(), new Image()
];
pererecaImgs[0].src = 'assets/animations/perereca1.png';
pererecaImgs[1].src = 'assets/animations/perereca2.png';
pererecaImgs[2].src = 'assets/animations/perereca3.png';
pererecaImgs[3].src = 'assets/animations/perereca4.png';

let pererecaFrameIndex = 0;
let pererecaFrameDelay = 0;
const pererecaFrameSpeed = 10;

// Telas do jogo
const menuImg = new Image(); menuImg.src = 'assets/menu.png';
const gameOverImg = new Image(); gameOverImg.src = 'assets/gameover.png';
const oliveiraImg = new Image(); oliveiraImg.src = 'assets/assusta.png';

// Movimento da perereca
let pererecaDir = { x: 1, y: 0 };
let pererecaChangeTime = 0;

// Botões do menu
const menuButtons = {
    start: { x: 350, y: 200, width: 300, height: 50 },
    shop: { x: 350, y: 270, width: 300, height: 50 },
    skins: { x: 350, y: 340, width: 300, height: 50 },
    quit: { x: 350, y: 410, width: 300, height: 50 }
};

// Variáveis para posição do mouse
let mouseX = 0;
let mouseY = 0;

// Padrão de fundo dos botões (verde - para o menu)
const patternCanvas = document.createElement('canvas');
patternCanvas.width = 20;
patternCanvas.height = 20;
const pctx = patternCanvas.getContext('2d');
pctx.fillStyle = '#1e3a1e';
pctx.fillRect(0, 0, 20, 20);
pctx.strokeStyle = '#2a6f2a';
pctx.lineWidth = 2;
pctx.beginPath();
pctx.moveTo(0, 20);
pctx.lineTo(20, 0);
pctx.stroke();
pctx.beginPath();
pctx.moveTo(-5, 20);
pctx.lineTo(15, 0);
pctx.stroke();
pctx.beginPath();
pctx.moveTo(5, 20);
pctx.lineTo(25, 0);
pctx.stroke();
const pattern = ctx.createPattern(patternCanvas, 'repeat');

// Padrão vermelho para botões do Game Over
const redPatternCanvas = document.createElement('canvas');
redPatternCanvas.width = 20;
redPatternCanvas.height = 20;
const rpctx = redPatternCanvas.getContext('2d');
rpctx.fillStyle = '#5c0000';
rpctx.fillRect(0, 0, 20, 20);
rpctx.strokeStyle = '#8a0000';
rpctx.lineWidth = 2;
rpctx.beginPath();
rpctx.moveTo(0, 20);
rpctx.lineTo(20, 0);
rpctx.stroke();
rpctx.beginPath();
rpctx.moveTo(-5, 20);
rpctx.lineTo(15, 0);
rpctx.stroke();
rpctx.beginPath();
rpctx.moveTo(5, 20);
rpctx.lineTo(25, 0);
rpctx.stroke();
const redPattern = ctx.createPattern(redPatternCanvas, 'repeat');

// === EVENTOS ===
document.addEventListener("keydown", (e) => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", (e) => keys[e.key.toLowerCase()] = false);

canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    for (const button in menuButtons) {
        const b = menuButtons[button];
        if (x >= b.x && x <= b.x + b.width && y >= b.y && y <= b.y + b.height) {
            handleMenuClick(button);
            break;
        }
    }
});

canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;

    if (!gameStarted || gameOver) {
        let hovering = false;
        for (const key in menuButtons) {
            const b = menuButtons[key];
            if (mouseX >= b.x && mouseX <= b.x + b.width &&
                mouseY >= b.y && mouseY <= b.y + b.height) {
                hovering = true;
                break;
            }
        }
        canvas.style.cursor = hovering ? 'pointer' : 'default';
    } else {
        canvas.style.cursor = 'default';
    }
});

// === FUNÇÕES DO JOGO ===
const maxLives = 3;

function updateHeartsDisplay() {
    heartsContainer.innerHTML = '';
    for (let i = 0; i < maxLives; i++) {
        const heart = document.createElement('img');
        if (i < lives) {
            heart.src = 'assets/coracao.png';
        } else {
            heart.src = 'assets/coracaoVazio.png';
        }
        heart.className = 'heart';
        heartsContainer.appendChild(heart);
    }
}

function drawScaredMessage() {
    if (!showScaredMessage) return;

    const message = "Oliveira me assustou!";
    const x = frog.x + frog.width / 2;
    const y = frog.y - 30;
    
    // Fundo da mensagem
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    
    // Mede o texto
    ctx.font = "20px Arial";
    const textWidth = ctx.measureText(message).width;
    const padding = 10;
    
    // Balão de fala
    ctx.beginPath();
    ctx.roundRect(x - textWidth/2 - padding, y - 25, textWidth + padding*2, 30, 10);
    ctx.fill();
    ctx.stroke();
    
    // Texto
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(message, x, y - 10);
    
    // Triângulo apontando para o sapo
    ctx.beginPath();
    ctx.moveTo(x, y + 5);
    ctx.lineTo(x - 10, y + 15);
    ctx.lineTo(x + 10, y + 15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

function update() {
    if (!gameStarted || gameOver) return;

    // Controle do sapo
    if (keys["arrowright"] || keys["d"]) {
        frog.x += frog.speed;
        frogFacingRight = true;
    }
    if (keys["arrowleft"] || keys["a"]) {
        frog.x -= frog.speed;
        frogFacingRight = false;
    }
    if (keys["arrowup"] || keys["w"]) frog.y -= frog.speed;
    if (keys["arrowdown"] || keys["s"]) frog.y += frog.speed;

    // Animação do sapo
    const frogIsMoving = keys["arrowright"] || keys["d"] || 
                       keys["arrowleft"] || keys["a"] || 
                       keys["arrowup"] || keys["w"] || 
                       keys["arrowdown"] || keys["s"];
    
    if (frogIsMoving) {
        frogFrameDelay++;
        if (frogFrameDelay >= frogFrameSpeed) {
            frogFrameDelay = 0;
            frogFrameIndex = (frogFrameIndex + 1) % 4;
        }
    } else {
        frogFrameIndex = 0;
    }

    // Movimento do oliveira
    if (frog.x > oliveira.x) oliveira.x += oliveira.speed;
    else if (frog.x < oliveira.x) oliveira.x -= oliveira.speed;
    if (frog.y > oliveira.y) oliveira.y += oliveira.speed;
    else if (frog.y < oliveira.y) oliveira.y -= oliveira.speed;

    // Movimento da perereca
    const prevX = perereca.x;
    const prevY = perereca.y;
    const dx = frog.x - perereca.x;
    const dy = frog.y - perereca.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 200) {
        perereca.x -= (dx / dist) * perereca.speed;
        perereca.y -= (dy / dist) * perereca.speed;
    } else {
        perereca.x += pererecaDir.x * perereca.speed * 0.5;
        perereca.y += pererecaDir.y * perereca.speed * 0.5;
        pererecaChangeTime++;
        if (pererecaChangeTime > 60) {
            pererecaChangeTime = 0;
            const angle = Math.random() * Math.PI * 2;
            pererecaDir.x = Math.cos(angle);
            pererecaDir.y = Math.sin(angle);
        }
    }

    // Animação da perereca
    const isMoving = Math.abs(perereca.x - prevX) > 0.5 || Math.abs(perereca.y - prevY) > 0.5;
    if (isMoving) {
        pererecaFrameDelay++;
        if (pererecaFrameDelay >= pererecaFrameSpeed) {
            pererecaFrameDelay = 0;
            pererecaFrameIndex++;
            if (pererecaFrameIndex > 3) pererecaFrameIndex = 1;
        }
    } else {
        pererecaFrameIndex = 0;
    }

    // Wrap perereca
    if (perereca.x + perereca.width < 0) perereca.x = canvas.width;
    if (perereca.x > canvas.width) perereca.x = -perereca.width;
    if (perereca.y + perereca.height < 0) perereca.y = canvas.height;
    if (perereca.y > canvas.height) perereca.y = -perereca.height;

    // Wrap frog
    if (frog.x + frog.width < 0) frog.x = canvas.width;
    if (frog.x > canvas.width) frog.x = -frog.width;
    if (frog.y + frog.height < 0) frog.y = canvas.height;
    if (frog.y > canvas.height) frog.y = -frog.height;

    // Colisão
    if (isColliding(frog, oliveira)) {
        lives--;
        updateHeartsDisplay();
        showScaredMessage = true;
        scaredMessageTimer = scaredMessageDuration;
        
        if (lives <= 0) {
            gameOver = true;
        } else {
            frog.x = 50;
            frog.y = 300;
            oliveira.x = 400;
            oliveira.y = 300;
        }
    }

    // Atualiza o timer da mensagem
    if (showScaredMessage) {
        scaredMessageTimer--;
        if (scaredMessageTimer <= 0) {
            showScaredMessage = false;
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (gameOver) {
        ctx.drawImage(gameOverImg, 0, 0, canvas.width, canvas.height);
        drawButtons();
        return;
    }

    if (!gameStarted) {
        ctx.drawImage(menuImg, 0, 0, canvas.width, canvas.height);
        drawButtons();
        return;
    }

    // Desenha a perereca
    ctx.save();
    if (pererecaDir.x < 0) {
        ctx.translate(perereca.x + perereca.width / 2, perereca.y + perereca.height / 2);
        ctx.scale(-1, 1);
        ctx.drawImage(pererecaImgs[pererecaFrameIndex], -perereca.width / 2, -perereca.height / 2, perereca.width, perereca.height);
    } else {
        ctx.drawImage(pererecaImgs[pererecaFrameIndex], perereca.x, perereca.y, perereca.width, perereca.height);
    }
    ctx.restore();

    // Desenha o sapo
    ctx.save();
    if (!frogFacingRight) {
        ctx.translate(frog.x + frog.width / 2, frog.y + frog.height / 2);
        ctx.scale(-1, 1);
        ctx.drawImage(frogImgs[frogFrameIndex], -frog.width / 2, -frog.height / 2, frog.width, frog.height);
    } else {
        ctx.drawImage(frogImgs[frogFrameIndex], frog.x, frog.y, frog.width, frog.height);
    }
    ctx.restore();

    // Desenha o oliveira
    ctx.drawImage(oliveiraImg, oliveira.x, oliveira.y, oliveira.width, oliveira.height);

    // Desenha a mensagem se necessário
    drawScaredMessage();
}

function drawButtons() {
    ctx.font = "28px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    if (gameOver) {
        const tryAgainBtn = {
            width: 300,
            height: 50,
            x: canvas.width - 310,
            y: canvas.height - 120
        };

        const menuBtn = {
            width: 300,
            height: 50,
            x: canvas.width - 310,
            y: canvas.height - 60
        };

        // Botões vermelhos do Game Over
        ctx.fillStyle = redPattern;
        ctx.fillRect(tryAgainBtn.x, tryAgainBtn.y, tryAgainBtn.width, tryAgainBtn.height);
        
        const isHoverTryAgain = (mouseX >= tryAgainBtn.x && mouseX <= tryAgainBtn.x + tryAgainBtn.width &&
                               mouseY >= tryAgainBtn.y && mouseY <= tryAgainBtn.y + tryAgainBtn.height);
        if (isHoverTryAgain) {
            ctx.fillStyle = 'rgba(139, 0, 0, 0.6)';
            ctx.fillRect(tryAgainBtn.x, tryAgainBtn.y, tryAgainBtn.width, tryAgainBtn.height);
        }

        ctx.strokeStyle = "#8a0000";
        ctx.lineWidth = 2;
        ctx.strokeRect(tryAgainBtn.x, tryAgainBtn.y, tryAgainBtn.width, tryAgainBtn.height);

        ctx.fillStyle = "white";
        ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        ctx.shadowBlur = 2;
        ctx.fillText("Tentar Novamente", tryAgainBtn.x + tryAgainBtn.width / 2, tryAgainBtn.y + tryAgainBtn.height / 2);

        ctx.fillStyle = redPattern;
        ctx.fillRect(menuBtn.x, menuBtn.y, menuBtn.width, menuBtn.height);
        
        const isHoverMenu = (mouseX >= menuBtn.x && mouseX <= menuBtn.x + menuBtn.width &&
                           mouseY >= menuBtn.y && mouseY <= menuBtn.y + menuBtn.height);
        if (isHoverMenu) {
            ctx.fillStyle = 'rgba(139, 0, 0, 0.6)';
            ctx.fillRect(menuBtn.x, menuBtn.y, menuBtn.width, menuBtn.height);
        }

        ctx.strokeStyle = "#8a0000";
        ctx.lineWidth = 2;
        ctx.strokeRect(menuBtn.x, menuBtn.y, menuBtn.width, menuBtn.height);

        ctx.fillStyle = "white";
        ctx.fillText("Voltar ao Menu", menuBtn.x + menuBtn.width / 2, menuBtn.y + menuBtn.height / 2);

        ctx.shadowColor = "transparent";
        
        menuButtons.tryAgain = tryAgainBtn;
        menuButtons.menu = menuBtn;
    } else if (!gameStarted) {
        // Botões verdes do menu principal
        for (const key in menuButtons) {
            if (key === 'tryAgain' || key === 'menu') continue;
            
            const b = menuButtons[key];
            const isHover = (mouseX >= b.x && mouseX <= b.x + b.width &&
                             mouseY >= b.y && mouseY <= b.y + b.height);

            ctx.fillStyle = pattern;
            ctx.fillRect(b.x, b.y, b.width, b.height);

            if (isHover) {
                ctx.fillStyle = 'rgba(102, 204, 102, 0.4)';
                ctx.fillRect(b.x, b.y, b.width, b.height);
            }

            ctx.strokeStyle = "white";
            ctx.lineWidth = 2;
            ctx.strokeRect(b.x, b.y, b.width, b.height);

            ctx.fillStyle = "white";
            ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.shadowBlur = 2;

            let text = "";
            switch(key) {
                case 'start': text = "Tente Furar"; break;
                case 'shop': text = "Good Price"; break;
                case 'skins': text = "Altere sua Carcaça"; break;
                case 'quit': text = "Here Went"; break;
            }
            ctx.fillText(text, b.x + b.width / 2, b.y + b.height / 2);
            ctx.shadowColor = "transparent";
        }
    }
}

function isColliding(a, b) {
    const padding = 1;
    return (a.x + padding < b.x + b.width &&
            a.x + a.width - padding > b.x &&
            a.y + padding < b.y + b.height &&
            a.y + a.height - padding > b.y);
}

function handleMenuClick(button) {
    switch(button) {
        case 'start':
            gameStarted = true;
            gameOver = false;
            updateHeartsDisplay();
            break;
        case 'tryAgain':
            resetGame();
            break;
        case 'menu':
            gameStarted = false;
            gameOver = false;
            lives = 3;
            frog.x = 50;
            frog.y = 300;
            oliveira.x = 400;
            oliveira.y = 300;
            updateHeartsDisplay();
            break;
        case 'shop':
            alert('Loja ainda não implementada!');
            break;
        case 'skins':
            alert('Skins ainda não implementadas!');
            break;
        case 'quit':
            if (confirm('Deseja realmente sair do jogo?')) {
                window.close();
            }
            break;
    }
}

function resetGame() {
    frog.x = 50;
    frog.y = 300;
    oliveira.x = 400;
    oliveira.y = 300;
    lives = 3;
    frogFacingRight = true;
    gameOver = false;
    gameStarted = true;
    keys = {};
    showScaredMessage = false;
    
    delete menuButtons.tryAgain;
    delete menuButtons.menu;
    
    updateHeartsDisplay();
}

// === INICIALIZAÇÃO ===
let loadedImages = 0;
const totalImages = 11;

function checkLoaded() {
    loadedImages++;
    if (loadedImages === totalImages) {
        requestAnimationFrame(loop);
    }
}

frogImgs.forEach(img => img.onload = checkLoaded);
pererecaImgs.forEach(img => img.onload = checkLoaded);
oliveiraImg.onload = checkLoaded;
menuImg.onload = checkLoaded;
gameOverImg.onload = checkLoaded;

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}