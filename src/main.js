import { loadImage, getInput } from "./utils.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

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
    title: "JS Game Launcher 101!",
    bullets: [
      "I'm Luis. I work alone. No one helps me.",
      "Broooolyn so slow",
      "You better applaud me",
      "Listen closely",
      "Don't be a jerk",
    ],
    image: "images/luis.png",
    imagePosition: "right", // or "left"
  },
  {
    title: "One day, I setup a new console",
    bullets: [
      "It was cool playing old games!",
      "But I wanted more",
      "I want MY OWN GAMES ON THIS!",
      "WEB ONLY FOR ME",
    ],
  },
  {
    title: "I will install Chrome on this thing!",
    bullets: [
      "apt? . . . NO",
      "curl . . yes!",
      "nvm . . yes!",
      "npm . . . yest!",
    ],
  },
  {
    title: "The web is cobbled",
    bullets: ["Skia", "V8", "Webkit", "Blink", "Gecko", "Edge"],
  },
  {
    title: "I can cobble shit together too!",
    bullets: ["Skia", "Canvas", "Gamepad API", "Sounds"],
  },
  {
    title: "Example Slide",
    bullets: ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
  },
  {
    title: "Example Slide",
    bullets: ["Bullet point 1", "Bullet point 2", "Bullet point 3"],
  },
  // Add more slides here
];

// Slide rendering configuration
const styles = {
  background: "#1c1c1c",
  title: {
    color: "#ffffff",
    fontSize: height * 0.08,
    font: "Arial",
    marginTop: height * 0.1,
  },
  bullets: {
    color: "#ffffff",
    fontSize: height * 0.04,
    font: "Arial",
    lineHeight: 1.5,
    marginLeft: width * 0.1,
    marginTop: height * 0.2,
  },
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

function renderSlide(slide, targetCtx) {
  // Clear and set background
  targetCtx.fillStyle = styles.background;
  targetCtx.fillRect(0, 0, width, height);

  // Draw title
  targetCtx.fillStyle = styles.title.color;
  targetCtx.font = `${styles.title.fontSize}px ${styles.title.font}`;
  targetCtx.textAlign = "center";
  targetCtx.fillText(slide.title, width / 2, styles.title.marginTop);

  // Calculate content area
  let contentStartX = styles.bullets.marginLeft;
  let contentWidth = width - styles.bullets.marginLeft * 2;

  // Handle image if present
  if (slide.image) {
    const img = slideImages[slide.image];
    if (img) {
      const imgWidth = width * 0.4;
      const imgHeight = (imgWidth * img.height) / img.width;
      const imgY = height * 0.3;

      if (slide.imagePosition === "left") {
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
  targetCtx.textAlign = "left";
  targetCtx.fillStyle = styles.bullets.color;

  slide.bullets.forEach((bullet, index) => {
    const y =
      styles.bullets.marginTop +
      index * styles.bullets.fontSize * styles.bullets.lineHeight;
    targetCtx.fillText(`• ${bullet}`, contentStartX, y);
  });
}

function draw() {
  // Clear canvas
  ctx.fillStyle = styles.background;
  ctx.fillRect(0, 0, width, height);

  if (!isTransitioning) {
    renderSlide(slides[currentSlide], ctx);
    return;
  }

  // During transition
  const fromSlide = currentSlide - transitionDirection;
  const toSlide = currentSlide;

  if (
    fromSlide >= 0 &&
    fromSlide < slides.length &&
    toSlide >= 0 &&
    toSlide < slides.length
  ) {
    // Save the current context state
    ctx.save();

    // Create a clipping region for the first slide
    ctx.beginPath();
    ctx.rect(0, 0, width * (1 - transitionProgress), height);
    ctx.clip();

    // Render first slide
    renderSlide(slides[fromSlide], ctx);

    // Restore and create clipping region for second slide
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.rect(
      width * (1 - transitionProgress),
      0,
      width * transitionProgress,
      height
    );
    ctx.clip();

    // Render second slide
    renderSlide(slides[toSlide], ctx);

    // Restore context
    ctx.restore();

    // Draw pixelated transition line
    const lineX = width * (1 - transitionProgress);
    for (let y = 0; y < height; y += PIXEL_SIZE) {
      ctx.fillStyle = y % (PIXEL_SIZE * 2) === 0 ? "#fff" : "#000";
      ctx.fillRect(lineX - 2, y, 4, PIXEL_SIZE);
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
