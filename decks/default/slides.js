// Default presentation deck
export const slides = [
  {
    title: "HalfStack Phoenix 2025! 🚀",
    bullets: [],
    image: "images/halfstack-logo.png",
    imagePosition: "full",
    textStyle: {
      titleColor: "#ffffff",
      bulletColor: "#ffffff",
      titleShadow: "2px 2px 4px rgba(0,0,0,0.5)",
      bulletShadow: "2px 2px 4px rgba(0,0,0,0.5)",
    },
  },
  {
    title: "🚀 Browser APIs without a Browser! 🚀",
    bullets: [
      "👋 I'm Luis Montes.",
      "You can find with @monteslu in most places (Bluesky, Discord, Fosstodon, Github, etc)",
    ],
  },

  {
    title: "Retropie, Batocera, Knulli 🚀",
    bullets: [],
    // "I setup a new retro gaming console 🎮 ",
    image: "images/pi-controller-box.png",
    imagePosition: "full",
    textStyle: {
      titleColor: "#ffffff",
      bulletColor: "#ffffff",
      titleShadow: "2px 2px 4px rgba(0,0,0,0.5)",
      bulletShadow: "2px 2px 4px rgba(0,0,0,0.5)",
    },
  },

  {
    title: "ROMS! 🚀",
    bullets: [],
    image: "images/roms.png",
    imagePosition: "full",
    textStyle: {
      titleColor: "#ffffff",
      bulletColor: "#ffffff",
      titleShadow: "2px 2px 4px rgba(0,0,0,0.5)",
      bulletShadow: "2px 2px 4px rgba(0,0,0,0.5)",
    },
  },

  {
    title: "I want to make my own ROMs",
    bullets: [
      "Atari 2600 ?",
      "6502 Assembly from 1975",
      "128 bytes of RAM 😬",
    ],
  },

  {
    title: "2024's Game of the Year",
    bullets: [],
    image: "images/balatro.png",
    imagePosition: "full",
  },

  {
    title: "Use the web! 🌐",
    bullets: [
      "FullScreen Canvas",
      "WebAudio",
      "Gamepad API",
      "All the cool web APIs!"
    ],
  },

  {
    title: "Game Loop 🚀",
    bullets: [],
    image: "images/gameloop.png",
    imagePosition: "full",
    textStyle: {
      titleColor: "#ffffff",
      bulletColor: "#ffffff",
      titleShadow: "2px 2px 4px rgba(0,0,0,0.5)",
      bulletShadow: "2px 2px 4px rgba(0,0,0,0.5)",
    },
  },
  {
    title: "Loop functions 🚀",
    bullets: [],
    image: "images/loopfunctions.png",
    imagePosition: "full",
    textStyle: {
      titleColor: "#ffffff",
      bulletColor: "#ffffff",
      titleShadow: "2px 2px 4px rgba(0,0,0,0.5)",
      bulletShadow: "2px 2px 4px rgba(0,0,0,0.5)",
    },
  },

  {
    title: "I'll just install Chrome or Firefox! 🌐",
    bullets: [
      "✅ Canvas ...yes!",
      "👇 WebAudio ...after a click!",
      "👀 Gamepad API ...doesn't count as a click",
      "😵‍💫 Fullscreen ...sometimes",
    ],
  },
  {
    title: "So then use Electron 🌐",
    bullets: [
      "✅ Awesome on powerful machines",
      "❌ Not as awesome on 50 dollar Anbernic Gameboy knockoffs",
    ],
  },
  {
    title: "Just build your own browser 🌐",
    bullets: [
      "✅ No need to bother with the DOM",
      "✅ No need to bother with CSS",
      "✅ No need for tabs, URL bars, search engine integration",
    ],
  },
  {
    title: "Sr. Prinicipal Architect Lead :",
    bullets: [
      "🫡 We do NOT do these things because they are EASY",
    ],
  },
  {
    title: "Sr. Prinicipal Architect Lead :",
    bullets: [
      "... we do these things because we THOUGHT it would be easy ",
    ],
  },
  {
    title: "Start with libSDL",
    bullets: [
      "Window",
      "Audio device",
      "Input",
      "@kmamal/sdl Node.js bindings",
    ],
  },

  {
    title: "Add a canvas 🖼️",
    bullets: [
      "❌ DIY",
      "❌ PureImage",
      "❌ node-canvas (Automattic)",
      "✅ skia canvas",
      "✅ @napi-rs/canvas ⚡️",
    ],
  },
  // {
  //   title: "The web is . . .  🏗️",
  //   bullets: [
  //     "🎨 Skia",
  //     "⚡ V8",
  //     "🕸️ Webkit",
  //     "💫 Blink",
  //     "🦊 Gecko",
  //     "🌐 Edge",
  //   ],
  // },

  // {
  //   title: "I can cobble stuff together too! 🛠️",
  //   bullets: ["🎨 Skia", "🖼️ Canvas", "🎮 Gamepad API", "🔊 Sounds"],
  // },
  // {
  //   title: "A**h***ish about performance",
  //   bullets: ["Can it run on an A53 (H700)?", "ambernic $50 device"],
  // },
  // {
  //   title: "Age of discovery",
  //   bullets: [
  //     "DIY",
  //     "libSDL2",
  //     "skia canvas",
  //     "automattic",
  //     "pureimage",
  //     "@napi-rs/canvas",
  //   ],
  // },
  {
    title: "But the web! No new frameworks!",
    bullets: [
      "🖼️ const img = new Image; img.src = 'images/me.jpg'; shim",
      "🌐 Fetch / XMLHttpRequest shim",
      "🎮 navigator.getGamepads() shim",
      "🎧 Web Audio shim",
      "🙂 FontFace shim",
      "💾 localStorage shim",
      "⚡️ WebSocket shim",
      "\"Shimmy Shimmy Ya\" -O.D.B.",
    ],
  },
  {
    title: "WebAssembly with threads !",
    bullets: ["Retroid Pocket 5 . . 8-Core Powerhouse"],
    image: "images/retroid-pocket-wasm.png",
    imagePosition: "full",
  },
  {
    title: "Party like it's 1999 🪩",
    bullets: [],
    image: "images/lanparty.png",
    imagePosition: "full",
  },
  {
    title: "Coming soon: 3D Acceleration",
    bullets: ["Web GL", "Web GPU (compute shaders!)"],
    image: "images/nvidia5900.png",
    imagePosition: "left",
  },
  {
    title: "AI Games",
    bullets: [],
    image: "images/ai-games.png",
    imagePosition: "full",
  },
  {
    title: "github.com/monteslu/jsgamelauncher",
    bullets: [],
    image: "images/retropile.jpg",
    imagePosition: "full",
  },
  {
    title: "Thanks!",
    bullets: [
      "🌟 Brooooooklyn for napi-rs & napi-rs/canvas",
      "🌟 Konstantin (kmamal) for his node sdl bindings",
      "🌟 Dylan for HalfStack",
      "🌟 ShelDon't",
      "",
      "FREE AI Hackathon Thursday February 20, 2025, Heatsync, 7pm-10pm",
      "Game Dev hackathon with devices in early March!",
    ],
  },
  {
    title: "Demo time...",
    bullets: ["press hotkey + start ?"],
    imagePosition: "full",
  },
];
