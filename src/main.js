import { loadImage, getInput } from './utils.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const { width, height } = canvas;
let lastTime;
let currentSlide = 0;
let canNavigate = true;

// Slide configuration
const slides = [
    {
        title: "Welcome to Canvas Slides",
        bullets: [
            "Simple canvas-based presentation system",
            "Use arrow keys to navigate",
            "Support for images and text"
        ],
        image: "images/welcome.png",
        imagePosition: "right" // or "left"
    },
    {
        title: "Example Slide",
        bullets: [
            "Bullet point 1",
            "Bullet point 2",
            "Bullet point 3"
        ]
    }
    // Add more slides here
];

// Slide rendering configuration
const styles = {
    background: '#1c1c1c',
    title: {
        color: '#ffffff',
        fontSize: height * 0.08,
        font: 'Arial',
        marginTop: height * 0.1
    },
    bullets: {
        color: '#ffffff',
        fontSize: height * 0.04,
        font: 'Arial',
        lineHeight: 1.5,
        marginLeft: width * 0.1,
        marginTop: height * 0.2
    }
};

function update() {
    const [p1] = getInput();
    
    if (canNavigate) {
        if (p1.DPAD_RIGHT.pressed) {
            if (currentSlide < slides.length - 1) {
                currentSlide++;
                canNavigate = false;
            }
        } else if (p1.DPAD_LEFT.pressed) {
            if (currentSlide > 0) {
                currentSlide--;
                canNavigate = false;
            }
        }
    }
    
    if (!p1.DPAD_RIGHT.pressed && !p1.DPAD_LEFT.pressed) {
        canNavigate = true;
    }
}

function draw() {
    const slide = slides[currentSlide];
    
    // Clear and set background
    ctx.fillStyle = styles.background;
    ctx.fillRect(0, 0, width, height);
    
    // Draw title
    ctx.fillStyle = styles.title.color;
    ctx.font = `${styles.title.fontSize}px ${styles.title.font}`;
    ctx.textAlign = 'center';
    ctx.fillText(slide.title, width/2, styles.title.marginTop);
    
    // Calculate content area
    let contentStartX = styles.bullets.marginLeft;
    let contentWidth = width - (styles.bullets.marginLeft * 2);
    
    // Handle image if present
    if (slide.image) {
        const img = slideImages[slide.image];
        if (img) {
            const imgWidth = width * 0.4;
            const imgHeight = (imgWidth * img.height) / img.width;
            const imgY = height * 0.3;
            
            if (slide.imagePosition === 'left') {
                ctx.drawImage(img, width * 0.05, imgY, imgWidth, imgHeight);
                contentStartX = width * 0.5;
                contentWidth = width * 0.45;
            } else {
                ctx.drawImage(img, width * 0.55, imgY, imgWidth, imgHeight);
                contentWidth = width * 0.45;
            }
        }
    }
    
    // Draw bullets
    ctx.font = `${styles.bullets.fontSize}px ${styles.bullets.font}`;
    ctx.textAlign = 'left';
    ctx.fillStyle = styles.bullets.color;
    
    slide.bullets.forEach((bullet, index) => {
        const y = styles.bullets.marginTop + 
                 (index * styles.bullets.fontSize * styles.bullets.lineHeight);
        ctx.fillText(`• ${bullet}`, contentStartX, y);
    });
}

const slideImages = {};

async function launch() {
    // Load all slide images
    for (const slide of slides) {
        if (slide.image) {
            try {
                slideImages[slide.image] = await loadImage(slide.image);
            } catch (e) {
                console.error(`Failed to load image: ${slide.image}`);
            }
        }
    }
    
    lastTime = performance.now();
    gameLoop();
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

launch();
