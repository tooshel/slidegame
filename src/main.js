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
const TRANSITION_SPEED = 0.003; // Adjust for faster/slower transitions
const PIXEL_SIZE = 8; // Size of the "pixels" in the transition effect

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

let prevRenderedSlide = -1;
let nextRenderedSlide = -1;

function draw() {
    // Clear main canvas
    ctx.fillStyle = styles.background;
    ctx.fillRect(0, 0, width, height);

    // Render current slide if needed
    if (nextRenderedSlide !== currentSlide) {
        renderSlide(slides[currentSlide], offCtxA);
        nextRenderedSlide = currentSlide;
    }
    
    if (!isTransitioning) {
        ctx.drawImage(offscreenA, 0, 0);
        return;
    }

    // During transition, render both current and adjacent slide
    const adjacentSlideIndex = transitionDirection > 0 ? 
        currentSlide - 1 : 
        currentSlide + 1;

    if (adjacentSlideIndex >= 0 && adjacentSlideIndex < slides.length) {
        // Render adjacent slide if needed
        if (prevRenderedSlide !== adjacentSlideIndex) {
            renderSlide(slides[adjacentSlideIndex], offCtxB);
            prevRenderedSlide = adjacentSlideIndex;
        }
        
        // Draw slides with pixelated transition effect
        const progress = transitionDirection > 0 ? 
            transitionProgress : 
            1 - transitionProgress;

        for (let x = 0; x < width; x += PIXEL_SIZE) {
            for (let y = 0; y < height; y += PIXEL_SIZE) {
                const pixelProgress = (x / width + Math.sin(y * 0.05) * 0.1) - progress;
                
                if (pixelProgress > 0) {
                    ctx.drawImage(offscreenB, 
                        x, y, PIXEL_SIZE, PIXEL_SIZE,
                        x, y, PIXEL_SIZE, PIXEL_SIZE);
                } else {
                    ctx.drawImage(offscreenA,
                        x, y, PIXEL_SIZE, PIXEL_SIZE,
                        x, y, PIXEL_SIZE, PIXEL_SIZE);
                }
            }
        }
    } else {
        // No adjacent slide, just show current
        ctx.drawImage(offscreenA, 0, 0);
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
