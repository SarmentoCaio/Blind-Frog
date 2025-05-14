const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const frog = { x: 50, y: 300, width: 64, height: 64, speed: 8 };
const oliveira = { x: 400, y: 300, width: 80, height: 80, speed: 3 };
const perereca = { x: 200, y: 100, width: 48, height: 48, speed: 8 };
let keys = {};
let gameOver = false;

const frogImg = new Image();
frogImg.src = 'assets/frog.png';

const oliveiraImg = new Image();
oliveiraImg.src = 'assets/assusta.png';

const pererecaImg = new Image();
pererecaImg.src = 'assets/perereca.png'; 

document.addEventListener("keydown", (e) => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", (e) => keys[e.key.toLowerCase()] = false);

//Faz perereca andar sozinha pelo mapa
let pererecaDir = { x: 1, y: 0 };
let pererecaChangeTime = 0;

function update() {
  if (gameOver) return;

  // Movimento do sapo - horizontal
  if (keys["arrowright"] || keys["d"]) frog.x += frog.speed;
  if (keys["arrowleft"] || keys["a"]) frog.x -= frog.speed;

  // Movimento do sapo - vertical
  if (keys["arrowup"] || keys["w"]) frog.y -= frog.speed;
  if (keys["arrowdown"] || keys["s"]) frog.y += frog.speed;

  // Movimento do inimigo Oliveira para perseguir o sapo
  if (frog.x > oliveira.x) oliveira.x += oliveira.speed;
  else if (frog.x < oliveira.x) oliveira.x -= oliveira.speed;

  if (frog.y > oliveira.y) oliveira.y += oliveira.speed;
  else if (frog.y < oliveira.y) oliveira.y -= oliveira.speed;

// Movimento da perereca
  const dx = frog.x - perereca.x;
  const dy = frog.y - perereca.y;
  const dist = Math.sqrt(dx * dx + dy * dy);

if (dist < 200) {
  // Foge do sapo
  perereca.x -= (dx / dist) * perereca.speed;
  perereca.y -= (dy / dist) * perereca.speed;
} else {
  // Movimento aleatório
  perereca.x += pererecaDir.x * perereca.speed * 0.5;
  perereca.y += pererecaDir.y * perereca.speed * 0.5;

  pererecaChangeTime++;
  if (pererecaChangeTime > 60) { // a cada ~1 segundo
    pererecaChangeTime = 0;
    const angle = Math.random() * Math.PI * 2;
    pererecaDir.x = Math.cos(angle);
    pererecaDir.y = Math.sin(angle);
  }
}

// Wrap perereca horizontal
  if (perereca.x + perereca.width < 0) perereca.x = canvas.width;
  if (perereca.x > canvas.width) perereca.x = -perereca.width;

// Wrap perereca vertical
  if (perereca.y + perereca.height < 0) perereca.y = canvas.height;
  if (perereca.y > canvas.height) perereca.y = -perereca.height;


// Wrap horizontal
  if (frog.x + frog.width < 0) frog.x = canvas.width;
  if (frog.x > canvas.width) frog.x = -frog.width;

// Wrap vertical
  if (frog.y + frog.height < 0) frog.y = canvas.height;
  if (frog.y > canvas.height) frog.y = -frog.height;

  // Colisão
  if (isColliding(frog, oliveira)) {
  gameOver = true;
  setTimeout(() => {
    alert("Oliveira me assustou");
    resetGame(); // Reinicia após o alerta
  }, 100);
}
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  // Perereca com sprite
  ctx.drawImage(pererecaImg, perereca.x, perereca.y, perereca.width, perereca.height);

  // Sapo com sprite
  ctx.drawImage(frogImg, frog.x, frog.y, frog.width, frog.height);

  // Oliveira com sprite
  ctx.drawImage(oliveiraImg, oliveira.x, oliveira.y, oliveira.width, oliveira.height);

  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "24px Arial";
    ctx.fillText("Game Over", 330, 200);
  }
}

function isColliding(a, b) {
  const padding = 1; // quanto menor, mais perto precisa estar
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
pererecaImg.onload = checkLoaded;

function checkLoaded() {
  loadedImages++;
  if (loadedImages === 3) {
    requestAnimationFrame(loop);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

function resetGame() {
  frog.x = 50;
  frog.y = 300;
  oliveira.x = 400;
  oliveira.y = 300;
  gameOver = false;
  keys = {}; // Limpa as teclas pressionadas
}