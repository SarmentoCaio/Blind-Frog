// === VARIAVEIS E IMAGENS ===
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const frog = { x: 50, y: 300, width: 64, height: 64, speed: 8 };
const oliveira = { x: 400, y: 300, width: 80, height: 80, speed: 3 };
const perereca = { x: 200, y: 100, width: 48, height: 48, speed: 8 };
let keys = {};
let gameOver = false;

const frogImg = new Image(); frogImg.src = 'assets/frog.png';
const oliveiraImg = new Image(); oliveiraImg.src = 'assets/assusta.png';

const pererecaImgs = [
  new Image(), new Image(), new Image(), new Image()
];
pererecaImgs[0].src = 'assets/animations/perereca1.png'; // parada
pererecaImgs[1].src = 'assets/animations/perereca2.png';
pererecaImgs[2].src = 'assets/animations/perereca3.png';
pererecaImgs[3].src = 'assets/animations/perereca4.png';

let pererecaFrameIndex = 0;
let pererecaFrameDelay = 0;
const pererecaFrameSpeed = 10;

// Direcao aleatoria e tempo para mudar
let pererecaDir = { x: 1, y: 0 };
let pererecaChangeTime = 0;

// === EVENTOS DE TECLADO ===
document.addEventListener("keydown", (e) => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", (e) => keys[e.key.toLowerCase()] = false);

// === LOOP PRINCIPAL ===
function update() {
  if (gameOver) return;

  // Movimento do sapo
  if (keys["arrowright"] || keys["d"]) frog.x += frog.speed;
  if (keys["arrowleft"] || keys["a"]) frog.x -= frog.speed;
  if (keys["arrowup"] || keys["w"]) frog.y -= frog.speed;
  if (keys["arrowdown"] || keys["s"]) frog.y += frog.speed;

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
    gameOver = true;
    setTimeout(() => {
      alert("Oliveira me assustou");
      resetGame();
    }, 100);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(pererecaImgs[pererecaFrameIndex], perereca.x, perereca.y, perereca.width, perereca.height);
  ctx.drawImage(frogImg, frog.x, frog.y, frog.width, frog.height);
  ctx.drawImage(oliveiraImg, oliveira.x, oliveira.y, oliveira.width, oliveira.height);
  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "24px Arial";
    ctx.fillText("Game Over", 330, 200);
  }
}

function isColliding(a, b) {
  const padding = 1;
  return (
    a.x + padding < b.x + b.width &&
    a.x + a.width - padding > b.x &&
    a.y + padding < b.y + b.height &&
    a.y + a.height - padding > b.y
  );
}

let loadedImages = 0;
frogImg.onload = checkLoaded;
oliveiraImg.onload = checkLoaded;
pererecaImgs.forEach(img => img.onload = checkLoaded);

function checkLoaded() {
  loadedImages++;
  if (loadedImages === 5) {
    requestAnimationFrame(loop);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

function resetGame() {
  frog.x = 50; frog.y = 300;
  oliveira.x = 400; oliveira.y = 300;
  gameOver = false;
  keys = {};
}
