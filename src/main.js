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

function renderSlide(slide, offsetX = 0) {
    // Create an offscreen canvas for the slide
    const offscreen = document.createElement('canvas');
    offscreen.width = width;
    offscreen.height = height;
    const offCtx = offscreen.getContext('2d');
    
    // Clear and set background
    offCtx.fillStyle = styles.background;
    offCtx.fillRect(0, 0, width, height);
    
    // Draw title
    offCtx.fillStyle = styles.title.color;
    offCtx.font = `${styles.title.fontSize}px ${styles.title.font}`;
    offCtx.textAlign = 'center';
    offCtx.fillText(slide.title, width/2, styles.title.marginTop);
    
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
                offCtx.drawImage(img, width * 0.05, imgY, imgWidth, imgHeight);
                contentStartX = width * 0.5;
                contentWidth = width * 0.45;
            } else {
                offCtx.drawImage(img, width * 0.55, imgY, imgWidth, imgHeight);
                contentWidth = width * 0.45;
            }
        }
    }
    
    // Draw bullets
    offCtx.font = `${styles.bullets.fontSize}px ${styles.bullets.font}`;
    offCtx.textAlign = 'left';
    offCtx.fillStyle = styles.bullets.color;
    
    slide.bullets.forEach((bullet, index) => {
        const y = styles.bullets.marginTop + 
                 (index * styles.bullets.fontSize * styles.bullets.lineHeight);
        offCtx.fillText(`• ${bullet}`, contentStartX, y);
    });

    return offscreen;
}

function draw() {
    // Clear main canvas
    ctx.fillStyle = styles.background;
    ctx.fillRect(0, 0, width, height);

    const currentSlideCanvas = renderSlide(slides[currentSlide]);
    
    if (!isTransitioning) {
        ctx.drawImage(currentSlideCanvas, 0, 0);
        return;
    }

    // During transition, render both current and adjacent slide
    const progress = transitionDirection > 0 ? transitionProgress : 1 - transitionProgress;
    const prevSlideIndex = transitionDirection > 0 ? currentSlide - 1 : currentSlide + 1;
    const prevSlide = slides[prevSlideIndex];
    
    if (prevSlide) {
        const prevSlideCanvas = renderSlide(prevSlide);
        
        // Draw slides with pixelated transition effect
        for (let x = 0; x < width; x += PIXEL_SIZE) {
            for (let y = 0; y < height; y += PIXEL_SIZE) {
                const pixelProgress = (x / width + Math.sin(y * 0.05) * 0.1) - progress;
                
                if (pixelProgress > 0) {
                    ctx.drawImage(prevSlideCanvas, 
                        x, y, PIXEL_SIZE, PIXEL_SIZE,
                        x, y, PIXEL_SIZE, PIXEL_SIZE);
                } else {
                    ctx.drawImage(currentSlideCanvas,
                        x, y, PIXEL_SIZE, PIXEL_SIZE,
                        x, y, PIXEL_SIZE, PIXEL_SIZE);
                }
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
