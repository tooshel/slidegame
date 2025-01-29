import { loadImage, getInput } from './utils.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const { width, height } = canvas;
let lastTime;
let currentSlide = 0;
let canNavigate = true;
let transitionProgress = 0;
let isTransitioning = false;
let transitionDirection = 1; // 1 for right, -1 for left
const TRANSITION_SPEED = 0.015; // 5x faster transition
const PIXEL_SIZE = 16; // Larger pixels = less work

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
    if (isTransitioning) {
        transitionProgress += TRANSITION_SPEED;
        if (transitionProgress >= 1) {
            isTransitioning = false;
            transitionProgress = 0;
        }
        return;
    }

    const [p1] = getInput();
    
    if (canNavigate) {
        if (p1.DPAD_RIGHT.pressed) {
            if (currentSlide < slides.length - 1) {
                transitionDirection = 1;
                isTransitioning = true;
                transitionProgress = 0;
                currentSlide++;
                canNavigate = false;
            }
        } else if (p1.DPAD_LEFT.pressed) {
            if (currentSlide > 0) {
                transitionDirection = -1;
                isTransitioning = true;
                transitionProgress = 0;
                currentSlide--;
                canNavigate = false;
            }
        }
    }
    
    if (!p1.DPAD_RIGHT.pressed && !p1.DPAD_LEFT.pressed) {
        canNavigate = true;
    }
}

// Create two reusable offscreen canvases
const offscreenA = document.createElement('canvas');
const offscreenB = document.createElement('canvas');
offscreenA.width = width;
offscreenA.height = height;
offscreenB.width = width;
offscreenB.height = height;
const offCtxA = offscreenA.getContext('2d');
const offCtxB = offscreenB.getContext('2d');

function renderSlide(slide, targetCtx) {
    // Clear and set background
    targetCtx.fillStyle = styles.background;
    targetCtx.fillRect(0, 0, width, height);
    
    // Draw title
    targetCtx.fillStyle = styles.title.color;
    targetCtx.font = `${styles.title.fontSize}px ${styles.title.font}`;
    targetCtx.textAlign = 'center';
    targetCtx.fillText(slide.title, width/2, styles.title.marginTop);
    
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
                targetCtx.drawImage(img, width * 0.05, imgY, imgWidth, imgHeight);
                contentStartX = width * 0.5;
                contentWidth = width * 0.45;
            } else {
                targetCtx.drawImage(img, width * 0.55, imgY, imgWidth, imgHeight);
                contentWidth = width * 0.45;
            }
        }
    }
    
    // Draw bullets
    targetCtx.font = `${styles.bullets.fontSize}px ${styles.title.font}`;
    targetCtx.textAlign = 'left';
    targetCtx.fillStyle = styles.bullets.color;
    
    slide.bullets.forEach((bullet, index) => {
        const y = styles.bullets.marginTop + 
                 (index * styles.bullets.fontSize * styles.bullets.lineHeight);
        targetCtx.fillText(`• ${bullet}`, contentStartX, y);
    });
}

function draw() {
    // Clear main canvas
    ctx.fillStyle = styles.background;
    ctx.fillRect(0, 0, width, height);

    if (!isTransitioning) {
        // Just render current slide directly
        renderSlide(slides[currentSlide], ctx);
        return;
    }

    // During transition, render to offscreen canvases first
    const fromSlide = transitionDirection > 0 ? 
        currentSlide - 1 : 
        currentSlide;
    const toSlide = transitionDirection > 0 ? 
        currentSlide : 
        currentSlide - 1;

    if (fromSlide >= 0 && fromSlide < slides.length && 
        toSlide >= 0 && toSlide < slides.length) {
        
        // Render both slides to offscreen canvases
        renderSlide(slides[fromSlide], offCtxA);
        renderSlide(slides[toSlide], offCtxB);
        
        // Draw transition effect
        const progress = transitionProgress;

        for (let x = 0; x < width; x += PIXEL_SIZE) {
            const pixelProgress = (x / width) - progress;
            
            if (pixelProgress > 0) {
                ctx.drawImage(offscreenA, 
                    x, 0, PIXEL_SIZE, height,
                    x, 0, PIXEL_SIZE, height);
            } else {
                ctx.drawImage(offscreenB,
                    x, 0, PIXEL_SIZE, height,
                    x, 0, PIXEL_SIZE, height);
            }
        }
    }
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
