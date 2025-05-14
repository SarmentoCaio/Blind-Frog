const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const frog = { x: 50, y: 300, width: 64, height: 64, speed: 8 };
const oliveira = { x: 400, y: 300, width: 80, height: 80, speed: 2 };
let keys = {};
let gameOver = false;

const frogImg = new Image();
frogImg.src = 'frog.png';

const oliveiraImg = new Image();
oliveiraImg.src = 'assusta.png';

document.addEventListener("keydown", (e) => keys[e.key.toLowerCase()] = true);
document.addEventListener("keyup", (e) => keys[e.key.toLowerCase()] = false);

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

  // Wrap horizontal
  if (frog.x + frog.width < 0) frog.x = canvas.width;
  if (frog.x > canvas.width) frog.x = -frog.width;

// Wrap vertical
  if (frog.y + frog.height < 0) frog.y = canvas.height;
  if (frog.y > canvas.height) frog.y = -frog.height;


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

function checkLoaded() {
  loadedImages++;
  if (loadedImages === 2) {
    requestAnimationFrame(loop);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}
