const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const backgroundMusic = document.getElementById('backgroundMusic');
const jumpSound = new Audio('jump.mp3');
const gameOverSound = new Audio('gameover.mp3');
const explosionSound = new Audio('boom.mp3');


let gameStarted = false;
let gameOver = false;
let exploded = false;
let explosion = new Image();
explosion.src = 'exp.png';
let explosionPosition = null;
let explosionBox = null;
let score = 0;
let startScreen = true;
let speedMultiplier = 1;


let background = new Image();
background.src = 'background.jpg';

let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;


let gubbe = {
    x: 50,
    y: canvas.height - 150,
    width: 75,
    height: 75,
    speed: 5,
    jumping: false,
    jumpHeight: 175,
    groundY: canvas.height -150,
    img: new Image(),
};

gubbe.img.src = 'gubbe.gif';

let boxes = [];

let startImage = new Image();
startImage.src = 'start.jpg';

let difficulty = 'easy';

function setDifficulty(newDifficulty) {
  difficulty = newDifficulty;
}

function handleDifficultySelection(e) {
  if (e.key === '1') {
    setDifficulty('easy');
    startGame();
  } else if (e.key === '2') {
    setDifficulty('hard');
    startGame();
  }
}

window.addEventListener('keydown', handleDifficultySelection);



function showStartScreen() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

    if (startImage.complete) {
        let imgWidth = 800;
        let imgHeight = (startImage.height / startImage.width) * imgWidth;
        let imgX = (canvas.width - imgWidth) / 2;
        let imgY = (canvas.height - imgHeight) / 2;

        ctx.drawImage(startImage, imgX, imgY, imgWidth, imgHeight);
    } else {
        startImage.onload = () => {
            let imgWidth = 800;
            let imgHeight = (startImage.height / startImage.width) * imgWidth;
            let imgX = (canvas.width - imgWidth) / 2;
            let imgY = (canvas.height - imgHeight) / 2;

            ctx.drawImage(startImage, imgX, imgY, imgWidth, imgHeight);
        };
    }

    // Lägg till texten "1. Easy" och "2. Hard"
    ctx.font = '30px Arial';
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.fillText('1. Baby Mode', canvas.width / 2, canvas.height / 2 + 80);
    ctx.fillText('2. God Mode', canvas.width / 2, canvas.height / 2 + 130);

    if (!gameStarted) {
        requestAnimationFrame(showStartScreen);
    }
}




setInterval(increaseSpeed, 30000); // Kör increaseSpeed var 30:e sekund (30000 ms)

function drawDifficulty() {
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Svårighetsgrad:", 150, 40);

    if (difficulty === "easy") {
        ctx.fillStyle = "lime";
        ctx.fillText("Baby Mode", 110, 70);
    } else {
        ctx.fillStyle = "red";
        ctx.fillText("God Mode", 102, 70);
    }
}





function updateScore(box) {
    if (gubbe.x > box.x + box.width && !box.counted) {
        score++;
        box.counted = true;
    }
}

let highscore = localStorage.getItem("highscore") || 0;

function drawScore() {
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.textAlign = 'right';
    ctx.fillText('Poäng: ' + score, canvas.width - 10, 30);
    ctx.fillText('Highscore: ' + highscore, canvas.width - 10, 60); // Lägger till highscore under poängen
}



function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function increaseSpeed() {
  let speedFactor = difficulty === 'easy' ? 0.5 : 2;
  speedMultiplier *= 1.1 * speedFactor;
}

function createBox() {
    
	
	
	let box = {
        x: canvas.width,
        y: canvas.height - 132,
        width: 50,
        height: 50,
        speed: getRandom(10, 30) / 10 *speedMultiplier, // Slumpmässig hastighet mellan 1x och 2x med 0.1x intervall
        img: new Image(),
    };
    box.img.src = 'tnt.png';
    boxes.push(box);

  let speedFactor = difficulty === 'easy' ? 0.75 : 3;
  box.speed = getRandom(10, 30) / 10 * speedMultiplier * speedFactor;
  
    // Skapar nästa låda med slumpmässigt intervall (minst 300px mellanrum och 1500 ms paus)
    let distance = box.width + getRandom(400, 1500);
    let minSpeed = 1;
    let maxSpeed = 3;
    let timeToCoverDistance = distance / ((minSpeed + maxSpeed) / 2);
    let nextBoxInterval = timeToCoverDistance + 1500;
    setTimeout(createBox, nextBoxInterval);
}

// Kommentera bort eller ta bort följande rad för att undvika att skapa boxar med fasta intervall
// setInterval(createBox, 1500);

// Lägg till denna rad för att skapa den första lådan och sätta igång den slumpmässiga skapandet av lådor
//createBox();


function startGame() {
    if (!gameStarted) {
        gameStarted = true;
        window.removeEventListener('keydown', startGame);
    }

    if (startScreen) {
        createBox();
        startScreen = false;
        requestAnimationFrame(update);
    }
}

window.addEventListener('keydown', startGame);




function checkCollision(rect1, rect2) {
    const buffer = 25; // Lägg till en buffert för att göra kollisionen mer förlåtande

    return (
        rect1.x + buffer < rect2.x + rect2.width &&
        rect1.x + rect1.width - buffer > rect2.x &&
        rect1.y + buffer < rect2.y + rect2.height &&
        rect1.y + rect1.height - buffer > rect2.y
    );
}


function showExplosion(box) {
    explosionSound.play();

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
      if (score > highscore) {
        highscore = score;
        localStorage.setItem("highscore", highscore);
    }
	let highScore = localStorage.getItem('highScore') ? parseInt(localStorage.getItem('highScore')) : 0;
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('highScore', highScore);
    }

    let gameOverImg = new Image();
    gameOverImg.src = 'gameover.png';
    gameOverImg.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        let imgWidth = 175;
        let imgHeight = (gameOverImg.height / gameOverImg.width) * imgWidth;

        let imgY = (canvas.height - imgHeight) / 6; // Flyttar upp bilden högre på canvasen

        ctx.drawImage(gameOverImg, (canvas.width - imgWidth) / 2, imgY, imgWidth, imgHeight);

        ctx.font = '30px Arial';
        ctx.fillStyle = 'black';
        ctx.textAlign = 'center';
        ctx.fillText('Poäng: ' + score, canvas.width / 2, imgY + 10 + imgHeight + 30); // Justerar poängens position baserat på den nya Y-koordinaten

        if (score === highScore) {
            ctx.fillText('Nytt Highscore!', canvas.width / 2, imgY + 10 + imgHeight + 70);
        } else {
            ctx.fillText('Highscore: ' + highScore, canvas.width / 2, imgY + 10 + imgHeight + 70);
        }

      gameOver = true;
    gameStarted = false; // Lägg till denna rad för att återställa gameStarted till false
    gameOverSound.play();
    backgroundMusic.pause();
    };
}






let keys = {
    ArrowLeft: false,
    ArrowRight: false,
    Space: false
};

function jump() {
    jumpSound.play();
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
//setInterval(createBox, 1500);

function update() {
      if (startScreen) {
        showStartScreen();
        return;
    }
	 if (!gameStarted) {
        showStartScreen();
        return;
    }

    if (gameOver) return;
	if (gameOver) return;
if (!gameOver && backgroundMusic.paused) {
    backgroundMusic.play();
}

	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);


    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
    drawDifficulty(); // Lägg till denna rad för att visa svårighetsgraden på skärmen	

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
showStartScreen();