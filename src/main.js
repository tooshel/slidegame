import {
  loadImage,
  getInput,
  createReourceLoader,
  drawLoadingScreen,
} from "./utils.js";

// the "with" syntax has to stay since this isn't alwyas used with vite
import packageJson from "../package.json" with { type: "json" };

const VERSION = packageJson.version;

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d", { alpha: false }); // Optimize for non-transparent canvas
canvas.height = 720;
canvas.width = 1280;
const { width, height } = canvas;
let lastTime = performance.now();
const imageCache = new Map(); // Cache for image dimensions
let isLoading = true;
let currentSlide = 0;
let canNavigate = true;
let transitionProgress = 0;
let isTransitioning = false;
let transitionDirection = 1; // 1 for right, -1 for left
// Performance settings
const settings = {
  transitions: false, // Disable transitions by default for better performance
  transitionDuration: 300,
  pixelSize: 16,
  throttleFPS: true, // Limit FPS for better performance
  targetFPS: 30,
  useImageSmoothing: false, // Disable image smoothing for better performance
  showFooter: false, // Show slide counter in bottom right
  bulletFontSize: height * 0.05 // Configurable bullet point size (was 0.04)
};

let lastFrameTime = 0;
const frameInterval = 1000 / settings.targetFPS;

let slides = [];

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
    fontSize: settings.bulletFontSize,
    font: "Arial",
    lineHeight: 1.5,
    marginLeft: width * 0.1,
    marginTop: height * 0.2,
  },
};

function update() {
  const currentTime = performance.now();
  
  // Throttle FPS if enabled
  if (settings.throttleFPS) {
    const elapsed = currentTime - lastFrameTime;
    if (elapsed < frameInterval) {
      return;
    }
    lastFrameTime = currentTime;
  }
  
  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  if (settings.transitions && isTransitioning) {
    transitionProgress += deltaTime / TRANSITION_DURATION;
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
        isTransitioning = settings.transitions;
        transitionProgress = 0;
        currentSlide++;
        canNavigate = false;
      }
    } else if (p1.DPAD_LEFT.pressed) {
      if (currentSlide > 0) {
        transitionDirection = -1;
        isTransitioning = settings.transitions;
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

// Create an offscreen canvas for image scaling
const offscreenCanvas = document.createElement('canvas');
const offscreenCtx = offscreenCanvas.getContext('2d', { alpha: false });

function renderSlide(slide, targetCtx) {
  // Clear and set background
  targetCtx.fillStyle = styles.background;
  targetCtx.fillRect(0, 0, width, height);
  

  // Draw slide counter in bottom-right if enabled
  if (settings.showFooter) {

    // Draw version number in bottom-left corner with improved contrast
    targetCtx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    targetCtx.font = '20px Roboto';
    targetCtx.textAlign = 'left';
    targetCtx.fillText(`v${VERSION}`, 10, height - 10);

    targetCtx.textAlign = 'right';
    targetCtx.fillText(`${currentSlide + 1}/${slides.length}`, width - 10, height - 10);
  }

  // Handle image if present
  if (slide.image) {
    const img = slideImages[slide.image];
    if (img) {
      if (slide.imagePosition === "fullscreen") {
        // Use cached scaled image if available
        const cachedImg = imageCache.get(`scaled_${slide.image}`);
        if (cachedImg) {
          targetCtx.drawImage(cachedImg, 0, 0);
        } else {
          // Scale image once and cache it
          const imgRatio = img.width / img.height;
          const screenRatio = width / height;
          
          offscreenCanvas.width = width;
          offscreenCanvas.height = height;
          
          if (imgRatio > screenRatio) {
            const drawHeight = height;
            const drawWidth = height * imgRatio;
            const drawX = (width - drawHeight * imgRatio) / 2;
            offscreenCtx.drawImage(img, Math.round(drawX), 0, Math.round(drawWidth), height);
          } else {
            const drawWidth = width;
            const drawHeight = width / imgRatio;
            const drawY = (height - width / imgRatio) / 2;
            offscreenCtx.drawImage(img, 0, Math.round(drawY), width, Math.round(drawHeight));
          }
          
          // Create a new canvas for caching
          const cacheCanvas = document.createElement('canvas');
          cacheCanvas.width = width;
          cacheCanvas.height = height;
          const cacheCtx = cacheCanvas.getContext('2d', { alpha: false });
          
          // Disable image smoothing for better performance
          cacheCtx.imageSmoothingEnabled = settings.useImageSmoothing;
          cacheCtx.drawImage(offscreenCanvas, 0, 0);
          
          // Cache the canvas
          imageCache.set(`scaled_${slide.image}`, cacheCanvas);
          
          // Draw to target
          targetCtx.imageSmoothingEnabled = settings.useImageSmoothing;
          targetCtx.drawImage(cacheCanvas, 0, 0);
        }
      } else if (slide.imagePosition === "full") {
        // Full width image
        const imgHeight = (width * img.height) / img.width;
        targetCtx.drawImage(img, 0, height * 0.2, width, imgHeight);
      } else {
        const imgWidth = width * 0.4;
        const imgHeight = (imgWidth * img.height) / img.width;
        const imgY = height * 0.3;

        if (slide.imagePosition === "left") {
          targetCtx.drawImage(img, width * 0.05, imgY, imgWidth, imgHeight);
        } else {
          targetCtx.drawImage(img, width * 0.55, imgY, imgWidth, imgHeight);
        }
      }
    }
  }

  // Skip text rendering if title is empty and no bullets
  if (!slide.title && (!slide.bullets || slide.bullets.length === 0)) {
    return;
  }

  // Calculate content area
  let contentStartX = styles.bullets.marginLeft;
  let contentWidth = width - styles.bullets.marginLeft * 2;
  if (slide.imagePosition === "left") {
    contentStartX = width * 0.5;
    contentWidth = width * 0.45;
  } else if (slide.imagePosition === "right") {
    contentWidth = width * 0.45;
  }

  // Draw title with optional shadow
  if (slide.title) {
    targetCtx.fillStyle = slide.textStyle?.titleColor || styles.title.color;
    const titleFontSize = styles.title.fontSize;
    targetCtx.font = `${titleFontSize}px ${styles.title.font}`;
    targetCtx.textAlign = "center";

    if (slide.textStyle?.titleShadow) {
      targetCtx.shadowColor = "rgba(0,0,0,0.5)";
      targetCtx.shadowBlur = 4;
      targetCtx.shadowOffsetX = 2;
      targetCtx.shadowOffsetY = 2;
    }

    targetCtx.fillText(slide.title, width / 2, styles.title.marginTop);
    targetCtx.shadowColor = "transparent";
  }

  // Draw bullets with word wrap
  if (slide.bullets && slide.bullets.length > 0) {
    const bulletFontSize = styles.bullets.fontSize;
    targetCtx.font = `${bulletFontSize}px ${styles.bullets.font}`;
    targetCtx.textAlign = "left";
    targetCtx.fillStyle = slide.textStyle?.bulletColor || styles.bullets.color;

    if (slide.textStyle?.bulletShadow) {
      targetCtx.shadowColor = "rgba(0,0,0,0.5)";
      targetCtx.shadowBlur = 4;
      targetCtx.shadowOffsetX = 2;
      targetCtx.shadowOffsetY = 2;
    }

    let currentY = styles.bullets.marginTop;

    slide.bullets.forEach((bullet, index) => {
      const words = bullet.split(" ");
      let line = "• ";
      let y = currentY;

      for (let word of words) {
        const testLine = line + word + " ";
        const metrics = targetCtx.measureText(testLine);

        if (metrics.width > contentWidth) {
          // Draw current line and start new one
          targetCtx.fillText(line, contentStartX, y);
          line = "  " + word + " "; // Indent continuation lines
          y += styles.bullets.fontSize * 1.2; // More comfortable line spacing for wrapped text
        } else {
          line = testLine;
        }
      }
      targetCtx.fillText(line, contentStartX, y);

      // Update starting Y position for next bullet, adding extra space for wrapped lines
      currentY = y + styles.bullets.fontSize * styles.bullets.lineHeight;
    });

    // Reset marginTop for next slide
    styles.bullets.marginTop = height * 0.2;
  }
}

function draw() {
  // Clear canvas
  ctx.fillStyle = styles.background;
  ctx.fillRect(0, 0, width, height);

  if (!settings.transitions || !isTransitioning) {
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

    // Calculate transition position based on direction
    const transX =
      transitionDirection > 0
        ? width * (1 - transitionProgress) // Right transition
        : width * transitionProgress; // Left transition

    // Create a clipping region for the first slide
    ctx.beginPath();
    ctx.rect(
      transitionDirection > 0 ? 0 : transX,
      0,
      transitionDirection > 0 ? transX : width - transX,
      height
    );
    ctx.clip();

    // Render first slide
    renderSlide(slides[fromSlide], ctx);

    // Restore and create clipping region for second slide
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.rect(
      transitionDirection > 0 ? transX : 0,
      0,
      transitionDirection > 0 ? width - transX : transX,
      height
    );
    ctx.clip();

    // Render second slide
    renderSlide(slides[toSlide], ctx);

    // Restore context
    ctx.restore();

    // Draw pixelated transition line
    const lineX = transX;
    for (let y = 0; y < height; y += PIXEL_SIZE) {
      ctx.fillStyle = y % (PIXEL_SIZE * 2) === 0 ? "#fff" : "#000";
      ctx.fillRect(lineX - 2, y, 4, PIXEL_SIZE);
    }
  }
}

const slideImages = {};

function clearImageCache() {
  // Remove old canvases from memory
  imageCache.forEach((canvas) => {
    canvas.width = 0;
    canvas.height = 0;
  });
  imageCache.clear();
}

async function launch() {
  // Handle window resize
  window.addEventListener('resize', clearImageCache);
  // Load the default deck
  try {
    const deckModule = await import("../decks/default/slides.js");
    slides = deckModule.slides;
  } catch (e) {
    console.error("Failed to load default deck:", e);
    return;
  }

  // Create resource loader with performance settings
  const loader = createReourceLoader();
  ctx.imageSmoothingEnabled = settings.useImageSmoothing;
  offscreenCtx.imageSmoothingEnabled = settings.useImageSmoothing;

  // Load fonts
  const fontPromises = [
    new FontFace("NotoEmoji", "url(fonts/NotoColorEmoji.ttf)").load(),
    new FontFace(
      "Orbitron",
      "url(fonts/Orbitron-VariableFont_wght.ttf)"
    ).load(),
    new FontFace("Roboto", "url(fonts/Roboto-Regular.ttf)").load(),
  ];

  // Load images
  for (const slide of slides) {
    if (slide.image) {
      loader.addImage(slide.image, slide.image);
    }
  }

  // Show loading progress
  function renderLoading() {
    if (!isLoading) return;
    drawLoadingScreen(
      ctx,
      loader.getPercentComplete(),
      styles.background,
      "#ffffff"
    );
    requestAnimationFrame(renderLoading);
  }
  renderLoading();

  // Wait for all resources
  try {
    const [loadedEmojiFont, loadedOrbitronFont, loadedRobotoFont] =
      await Promise.all([...fontPromises, loader.load()]);

    // Add fonts to document
    document.fonts.add(loadedEmojiFont);
    document.fonts.add(loadedOrbitronFont);
    document.fonts.add(loadedRobotoFont);

    // Update styles
    styles.title.font = "Orbitron, NotoEmoji";
    styles.bullets.font = "Roboto, NotoEmoji";

    // Get loaded images
    Object.assign(slideImages, loader.images);
  } catch (e) {
    console.error("Failed to load resources:", e);
  }

  // Everything is loaded
  isLoading = false;
  lastTime = performance.now();
  gameLoop();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

launch();
