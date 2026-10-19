const gameBoard = document.getElementById('game-board');
const stage = document.getElementById('candle-cont');
const scoreDisplay = document.getElementById('score-val');
const menuScreen = document.getElementById('start-screen');
const playBtn = document.getElementById('start-btn');
const hero = document.getElementById('boogeyman')

let currentScore = 0;
let playing = false;
let spawnedCandles = [];
let nextSpawnTime = 0;

let isJumping = false;
let speedY = 0;
const gravity = 0.8;

const ambientMusic = new Audio('imgs/spooky.mp3');
ambientMusic.loop = true;
ambientMusic.volume = 0.5;

const jumpSound = new Audio ('imgs/jump.mp3');
jumpSound.volume = 0.7;

const gameOverSound = new Audio ('imgs/gameover.mp3');
gameOverSound.volume = 1.0;

const clickSound = new Audio ('imgs/click.mp3');
clickSound.volume = 1.0;

const scoreSound = new Audio('imgs/score.mp3');
scoreSound.volume = 0.5;


gameBoard.addEventListener('click', (e) => {
    if (!playing || isJumping) return;

    e.preventDefault();

    isJumping = true;
    speedY = 16;

    jumpSound.currentTime = 0;
    jumpSound.play().catch(e => console.log('jump audio error:', e));
})

window.addEventListener('keydown', (e) => {
    if (!playing) return;
    if ((e.code === 'Space' || e.code === 'ArrowUp') && !isJumping) {
        isJumping = true;
        speedY = 16;

        jumpSound.currentTime = 0;
        jumpSound.play().catch(e => console.log('jump audio error:', e));
    }
});

function createCandle() {
    const obstacle = document.createElement('div');
    obstacle.classList.add('candle');
    
    
    obstacle.classList.add(Math.random() > 0.5 ? 'candle1' : 'candle2');
    
    
    let posX = window.innerWidth;
    obstacle.style.left = `${posX}px`;
    stage.appendChild(obstacle);

    
    spawnedCandles.push({
        element: obstacle,
        x: posX
    });
}

function runGameEngine(timestamp) {
    if (!playing) return;

    
    if (isJumping) {
        let currentBottom = parseFloat(window.getComputedStyle(hero).getPropertyValue('bottom')) || 0;
        hero.style.bottom = `${currentBottom + speedY}px`;
        speedY -= gravity;

        let floorLimit = window.innerHeight * 0.32;
        if (hero.getBoundingClientRect().bottom >= window.innerHeight - floorLimit + 20) {
            isJumping = false;
            speedY = 0;
            hero.style.bottom = '';
        }
    }

    
    if (timestamp > nextSpawnTime) {
        createCandle();
        
        nextSpawnTime = timestamp + (Math.random() * 1500 + 1500);
    }

    
    const heroRect = hero.getBoundingClientRect();
    
    for (let i = spawnedCandles.length - 1; i >= 0; i--) {
        const item = spawnedCandles[i];
        item.x -= 7; 
        item.element.style.left = `${item.x}px`;

        
        if (item.x < -50) {
            item.element.remove();
            spawnedCandles.splice(i, 1);
            currentScore += 10;
            scoreDisplay.textContent = currentScore;

            scoreSound.currentTime = 0;
            scoreSound.play().catch(e => console.log('score audio error:', e));
            continue;
        }

        const itemRect = item.element.getBoundingClientRect();
        if (
            heroRect.left < itemRect.right &&
            heroRect.right > itemRect.left &&
            heroRect.bottom > itemRect.top &&
            heroRect.top < itemRect.bottom
        ) {
            playing = false;

            gameOverSound.currentTime = 0;
            gameOverSound.play().catch(e => console.log('Game over audio error:', e));

           setTimeout(() => {
                alert(`Game Over! Final Score: ${currentScore}`);
                location.reload();
            }, 300);
            return;
        }
    }

    requestAnimationFrame(runGameEngine);
}

playBtn.addEventListener('click', (e) => {
    e.stopPropagation();

    clickSound.currentTime = 0;
    clickSound.play().catch(e => console.log('click sound audio error:', e));

    ambientMusic.currentTime = 3.3;
    ambientMusic.play().catch(e => console.log('BGM audio error'));
    
    menuScreen.style.display = 'none';
    playing = true;
    currentScore = 0;
    scoreDisplay.textContent = currentScore;
        
    stage.innerHTML = '';
    spawnedCandles = [];
        
    requestAnimationFrame((timestamp) => {
        nextSpawnTime = timestamp + 1000;
        runGameEngine(timestamp);
    });
});