const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const frog = { x: 50, y: 300, width: 64, height: 64, speed: 3 };
const oliveira = { x: 400, y: 300, width: 100, height: 100, speed: 2, direction: 1 };
let keys = {};
let gameOver = false;

const frogImg = new Image();
frogImg.src = 'frog.png';

const oliveiraImg = new Image();
oliveiraImg.src = 'assusta.png';

document.addEventListener("keydown", (e) => keys[e.key] = true);
document.addEventListener("keyup", (e) => keys[e.key] = false);

function update() {
  if (gameOver) return;

  // Movimento do sapo
  if (keys["ArrowRight"]) frog.x += frog.speed;
  if (keys["ArrowLeft"]) frog.x -= frog.speed;

  // Movimento do inimigo Oliveira
  oliveira.x += oliveira.speed * oliveira.direction;
  if (oliveira.x <= 0 || oliveira.x + oliveira.width >= canvas.width) {
    oliveira.direction *= -1;
  }

  // Colisão
  if (isColliding(frog, oliveira)) {
    gameOver = true;
    setTimeout(() => alert("Oliveira me assustou"), 100);
  }
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Sapo com sprite
  ctx.drawImage(frogImg, frog.x, frog.y, frog.width, frog.height);

  // Inimigo Oliveira (temporário: quadrado preto)
  ctx.fillStyle = "black";
  ctx.drawImage(oliveiraImg, oliveira.x, oliveira.y, oliveira.width, oliveira.height);

  if (gameOver) {
    ctx.fillStyle = "red";
    ctx.font = "24px Arial";
    ctx.fillText("Game Over", 330, 200);
  }
}

function isColliding(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

// Inicia o loop quando imagem do sapo carregar
frogImg.onload = () => {
  requestAnimationFrame(loop);
};

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
