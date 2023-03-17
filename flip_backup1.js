const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let gameOver = false;
let exploded = false;
let explosion = new Image();
explosion.src = 'exp.png';
let explosionPosition = null;
let explosionBox = null;
let score = 0;

let background = new Image();
background.src = 'background.jpg';


let gubbe = {
    x: 50,
    y: canvas.height - 125,
    width: 50,
    height: 50,
    speed: 5,
    jumping: false,
    jumpHeight: 125,
    groundY: canvas.height - 125,
    img: new Image(),
};

gubbe.img.src = 'gubbe.png';

let boxes = [];

function updateScore(box) {
    if (gubbe.x > box.x + box.width && !box.counted) {
        score++;
        box.counted = true;
    }
}

function drawScore() {
    ctx.font = '30px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + score, 10, 50);
}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createBox() {
    let box = {
        x: canvas.width,
        y: canvas.height - 132,
        width: 50,
        height: 50,
        speed: 3,
        img: new Image(),
    };
    box.img.src = 'tnt.png';
    boxes.push(box);
}

function checkCollision(rect1, rect2) {
    return (
        rect1.x < rect2.x + rect2.width &&
        rect1.x + rect1.width > rect2.x &&
        rect1.y < rect2.y + rect2.height &&
        rect1.y + rect1.height > rect2.y
    );
}

function showExplosion(box) {
    if (!exploded) {
        let explosion = new Image();
        explosion.src = 'exp.png';
        explosion.onload = () => {
            explosionBox = box;
            exploded = true;

            // Remove the collided box from the array
            boxes = boxes.filter((b) => b !== box);

            setTimeout(() => {
                gameOverSequence();
            }, 2000); // 2 sekunders paus
        };
    }
}



function gameOverSequence() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    ctx.font = '50px Arial';
    ctx.fillStyle = 'red';
    ctx.textAlign = 'center';
    ctx.fillText('REKT!', canvas.width / 2, canvas.height / 2);

    gameOver = true;
}

let keys = {
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
};

function jump() {
    if (!gubbe.jumping && gubbe.y === gubbe.groundY) {
        gubbe.jumping = true;
        gubbe.y -= gubbe.jumpHeight;
        setTimeout(() => {
            gubbe.jumping = false;
        }, 500);
    }
}

function moveGubbe(e) {
    if (e.code in keys) {
        keys[e.code] = e.type === 'keydown';
    }
}

function handleJump() {
    if (keys.Space) {
        jump();
    }
}

window.addEventListener('keydown', moveGubbe);
window.addEventListener('keyup', moveGubbe);

setInterval(handleJump, 50);
setInterval(createBox, 1500);

function update() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    if (!gubbe.jumping && gubbe.y < gubbe.groundY) {
        gubbe.y += gubbe.speed;
    }

    if (keys.ArrowLeft) {
        gubbe.x -= gubbe.speed;
    }

    if (keys.ArrowRight) {
        gubbe.x += gubbe.speed;
    }

    for (let i = 0; i < boxes.length; i++) {
        let box = boxes[i];
        box.x -= box.speed;
        ctx.drawImage(box.img, box.x, box.y, box.width, box.height);

        if (checkCollision(gubbe, box)) {
            showExplosion(box);
            break;
        }

        updateScore(box);
    }

    ctx.drawImage(gubbe.img, gubbe.x, gubbe.y, gubbe.width, gubbe.height);

    if (explosionPosition) {
        ctx.drawImage(explosion, explosionPosition.x, explosionPosition.y, explosionPosition.width * 3, explosionPosition.height * 3);
    }
    if (exploded && explosionBox) {
        let explosion = new Image();
        explosion.src = 'exp.png';
        ctx.drawImage(explosion, explosionBox.x - 99, explosionBox.y - 99, explosionBox.width * 3, explosionBox.height * 3);
    }

    if (!exploded) {
        requestAnimationFrame(update);
    }

    drawScore();
}

update();
