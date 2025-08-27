// --- Diamond Painting Game Core JS ---

// --- Configuration ---
const COLOR_HEXES = [
  "#ff1744", "#ff9100", "#fff700", "#69f0ae", "#00b0ff", "#d500f9",
  "#ffffff", "#bdbdbd", "#3e2723", "#212121", "#1976d2", "#43a047",
  "#fbc02d", "#f06292", "#8d6e63", "#00e676"
];
const SIZE_MAP = {
  20: 20,
  40: 40,
  60: 60,
  100: 100
};

// --- State ---
let currentColor = COLOR_HEXES[0];
let gridSize = 20;
let gridData = []; // 2D array [y][x] storing color hex or null

// --- DOM Elements ---
const gridEl = document.getElementById("gameGrid");
const colorPickerEl = document.getElementById("colorPicker");
const gridSizeEl = document.getElementById("gridSize");
const uploadBtn = document.getElementById("uploadImage");
const imageInput = document.getElementById("imageInput");

// --- Init ---
function init() {
  renderColorPicker();
  setGridSize(gridSize);
  gridSizeEl.value = gridSize;

  // Event Listeners
  colorPickerEl.addEventListener("click", handleColorPick);
  gridSizeEl.addEventListener("change", e => setGridSize(Number(e.target.value)));
  gridEl.addEventListener("mousedown", handleGridClick);
  gridEl.addEventListener("touchstart", handleGridClick, {passive: false});
  uploadBtn.addEventListener("click", () => imageInput.click());
  imageInput.addEventListener("change", handleImageUpload);
}

function renderColorPicker() {
  colorPickerEl.innerHTML = "";
  COLOR_HEXES.forEach(hex => {
    const btn = document.createElement("button");
    btn.style.background = hex;
    btn.dataset.hex = hex;
    btn.className = (hex === currentColor) ? "selected" : "";
    btn.title = hex;
    colorPickerEl.appendChild(btn);
  });
}

function setGridSize(size) {
  gridSize = SIZE_MAP[size] || 20;
  // Adjust cell size for ultra
  if (gridSize === 100) {
    gridEl.style.setProperty("--cell-size", "10px");
  } else {
    gridEl.style.setProperty("--cell-size", "24px");
  }
  // Empty grid data
  gridData = Array.from({length: gridSize}, () => Array(gridSize).fill(null));
  renderGrid();
}

function renderGrid() {
  gridEl.innerHTML = "";
  gridEl.style.gridTemplateColumns = `repeat(${gridSize}, var(--cell-size))`;
  gridEl.style.gridTemplateRows = `repeat(${gridSize}, var(--cell-size))`;

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const cell = document.createElement("div");
      cell.className = "grid-cell";
      cell.dataset.x = x;
      cell.dataset.y = y;
      const color = gridData[y][x];
      if (color) {
        cell.style.background = color;
        cell.classList.add("filled");
      }
      gridEl.appendChild(cell);
    }
  }
}

function handleColorPick(e) {
  if (e.target.tagName === "BUTTON" && e.target.dataset.hex) {
    currentColor = e.target.dataset.hex;
    Array.from(colorPickerEl.children).forEach(btn =>
      btn.classList.toggle("selected", btn.dataset.hex === currentColor)
    );
  }
}

function handleGridClick(e) {
  e.preventDefault();
  const target = e.target;
  if (!target.classList.contains("grid-cell")) return;
  const x = Number(target.dataset.x);
  const y = Number(target.dataset.y);

  gridData[y][x] = currentColor;
  renderGrid();
}

// --- Image Upload/Import (future expansion) ---
function handleImageUpload(e) {
  const file = e.target.files[0];
  if (!file || !file.type.startsWith("image/")) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    const img = new Image();
    img.onload = function() {
      importImageToGrid(img);
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

// Convert uploaded image to grid colors (simple average, 1:1 mapping for now)
function importImageToGrid(img) {
  // Draw image onto temp canvas at grid size
  const canvas = document.createElement("canvas");
  canvas.width = gridSize;
  canvas.height = gridSize;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, gridSize, gridSize);
  const imgData = ctx.getImageData(0, 0, gridSize, gridSize).data;

  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      const idx = (y * gridSize + x) * 4;
      const [r, g, b] = [imgData[idx], imgData[idx+1], imgData[idx+2]];
      // Find closest color in COLOR_HEXES
      const hex = rgbToClosestHex(r, g, b);
      gridData[y][x] = hex;
    }
  }
  renderGrid();
}

// Find closest color in palette
function rgbToClosestHex(r, g, b) {
  let minDist = Infinity, bestHex = COLOR_HEXES[0];
  COLOR_HEXES.forEach(hex => {
    const [hr, hg, hb] = hexToRgb(hex);
    const dist = (r-hr)**2 + (g-hg)**2 + (b-hb)**2;
    if (dist < minDist) {
      minDist = dist;
      bestHex = hex;
    }
  });
  return bestHex;
}

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.substr(0,2),16),
    parseInt(h.substr(2,2),16),
    parseInt(h.substr(4,2),16)
  ];
}

// --- Ready ---
window.addEventListener("DOMContentLoaded", init);
