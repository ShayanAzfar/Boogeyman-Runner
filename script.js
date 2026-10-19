const stage = document.getElementById('candle-cont');
const scoreDisplay = document.getElementById('score-val');
const menuScreen = document.getElementById('start-screen');
const playBtn = document.getElementById('start-btn');
const hero = document.getElementById('boogeyman');

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

window.addEventListener('click', () => {
    if (ambientMusic.paused) {
        ambientMusic.currentTime = 3.3;
        ambientMusic.play().catch(e => console.log('Audio init skipped:', e));
    }
}, { once: true });


window.addEventListener('keydown', (e) => {
    if (!playing) return;
    if ((e.code === 'Space' || e.code === 'ArrowUp') && !isJumping) {
        isJumping = true;
        speedY = 16;
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
            alert(`Game Over! Final Score: ${currentScore}`);
            location.reload();
            return;
        }
    }

    requestAnimationFrame(runGameEngine);
}

playBtn.addEventListener('click', () => {
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