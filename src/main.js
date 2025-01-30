import {
  loadImage,
  getInput,
  createReourceLoader,
  drawLoadingScreen,
} from "./utils.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.height = 720;
canvas.width = 1280;
const { width, height } = canvas;
let lastTime;
let isLoading = true;
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
    title: "JS Game Launcher 101! 🚀",
    bullets: [
      "👋 I'm Luis.",
      "You can find with @monteslu in most places (Bluesky, Discord, etc)",
      "This is me 10 years ago",
    ],
    image: "images/luis.png",
    imagePosition: "right", // can be "left", "right", or "full"
  },
  {
    title: "Once upon a time . . .",
    bullets: [
      "I setup a new retro gaming console 🎮 ",
      "Common 'themes' in Emulation Station, Knulli, Batocera",
      "🕹️ It was cool playing old games!",
      "✨ But I wanted more",
      "🎯 I want MY OWN GAMES ON THIS!",
      "🌐 WEB FO LIFE!",
    ],
  },
  {
    title: "I will install Chrome on this thing! 🌐",
    bullets: [
      "❌ apt? . . . NO",
      "❌ yum? . . . NO",
      "✅ brute force! . . . yes!",
    ],
  },
  {
    title: "Wow, that's slow. What else can I do?",
    bullets: [
      "❌ Electron? Nope, too slow",
      "❌ apt? . . . NO",
      "❌ yum? . . . NO",
      "✅ curl . . yes!",
      "✅ nvm . . yes, eventually!",
      "✅ npm/node . . . yes!",
    ],
  },
  {
    title: "The web is . . .  🏗️",
    bullets: [
      "🎨 Skia",
      "⚡ V8",
      "🕸️ Webkit",
      "💫 Blink",
      "🦊 Gecko",
      "🌐 Edge",
    ],
  },
  {
    title: "But for gaming . . . what do I need?",
    bullets: [
      "JavasScript . . . of course, need a game loop!",
      "canvas . . . for drawing!",
      "audio . . . for sounds!",
      "fullscreen!",
      "gamepad API!",
      "gestures!",
    ],
  },
  {
    title: "I can cobble stuff together too! 🛠️",
    bullets: ["🎨 Skia", "🖼️ Canvas", "🎮 Gamepad API", "🔊 Sounds"],
  },
  {
    title: "A**h*** about performance",
    bullets: ["Can it run on an A53 (H700)?", "ambernic $50 device"],
  },
  {
    title: "Age of discovery",
    bullets: [
      "DIY",
      "libSDL2",
      "skia canvas",
      "automattic",
      "pureimage",
      "@napi-rs/canvas",
    ],
  },
  {
    title: "But the web! No new frameworks!",
    bullets: [
      "SHIM SHIM SHIM",
      "var myimage = new Image, myImage.src = images/me.jpg",
      "Web Audio SHIM",
      "Fonts SHIM",
      "localStorage SHIM",
      "websocket SHIM",
    ],
  },
  {
    title: "Thanks!",
    bullets: ["🌟 Broooolyn is awesome! So grateful for his work!"],
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
  // Use a larger size for emoji font to match text
  const titleFontSize = styles.title.fontSize;
  targetCtx.font = `${titleFontSize}px ${styles.title.font}`;
  targetCtx.textAlign = "center";
  targetCtx.fillText(slide.title, width / 2, styles.title.marginTop);

  // Calculate content area
  let contentStartX = styles.bullets.marginLeft;
  let contentWidth = width - styles.bullets.marginLeft * 2;

  // Handle image if present
  if (slide.image) {
    const img = slideImages[slide.image];
    if (img) {
      if (slide.imagePosition === "full") {
        // Full width image
        const imgHeight = (width * img.height) / img.width;
        targetCtx.drawImage(img, 0, height * 0.2, width, imgHeight);

        // Move text below image
        contentStartX = styles.bullets.marginLeft;
        contentWidth = width - styles.bullets.marginLeft * 2;
        styles.bullets.marginTop = height * 0.2 + imgHeight + height * 0.05;
      } else {
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
  }

  // Draw bullets with word wrap
  // Use a larger size for emoji font to match text
  const bulletFontSize = styles.bullets.fontSize;
  targetCtx.font = `${bulletFontSize}px ${styles.bullets.font}`;
  targetCtx.textAlign = "left";
  targetCtx.fillStyle = styles.bullets.color;

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

async function launch() {
  // Create resource loader
  const loader = createReourceLoader();

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
