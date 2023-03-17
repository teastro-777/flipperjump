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

let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;


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
        speed: getRandom(10, 30) / 10, // Slumpmässig hastighet mellan 1x och 2x med 0.1x intervall
        img: new Image(),
    };
    box.img.src = 'tnt.png';
    boxes.push(box);

    // Skapar nästa låda med slumpmässigt intervall (minst 300px mellanrum och 1500 ms paus)
    let distance = box.width + getRandom(3000, 5000);
    let minSpeed = 1;
    let maxSpeed = 2;
    let timeToCoverDistance = distance / ((minSpeed + maxSpeed) / 2);
    let nextBoxInterval = timeToCoverDistance + 25000;
    setTimeout(createBox, nextBoxInterval);
}

// Kommentera bort eller ta bort följande rad för att undvika att skapa boxar med fasta intervall
// setInterval(createBox, 1500);

// Lägg till denna rad för att skapa den första lådan och sätta igång den slumpmässiga skapandet av lådor
createBox();






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
    let gameOverImg = new Image();
    gameOverImg.src = 'gameover.png';
    gameOverImg.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        let imgWidth = 175;
        let imgHeight = (gameOverImg.height / gameOverImg.width) * imgWidth;
        
        let imgY = (canvas.height - imgHeight) / 3; // Flyttar upp bilden högre på canvasen
        
        ctx.drawImage(gameOverImg, (canvas.width - imgWidth) / 2, imgY, imgWidth, imgHeight);

        ctx.font = '30px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText('Poäng: ' + score, canvas.width / 2, imgY+10 + imgHeight + 30); // Justerar poängens position baserat på den nya Y-koordinaten

        gameOver = true;
    };
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
