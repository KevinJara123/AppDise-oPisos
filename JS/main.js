const gridSize = 12;
const grid = document.getElementById('grid');
const stats = document.getElementById('stats');
const colorPicker = document.getElementById('colorPicker');
const tileSizeSelect = document.getElementById('tileSize');
const downloadBtn = document.getElementById('downloadBtn');
const capture = document.getElementById('capture');
let colorCount = {};

function setColor(color) {
  colorPicker.value = color;
}

function createGrid() {
  grid.innerHTML = '';
  colorCount = {};
  const size = parseInt(tileSizeSelect.value);
  grid.style.gridTemplateColumns = `repeat(${gridSize}, ${size}px)`;
  grid.style.gridTemplateRows = `repeat(${gridSize}, ${size}px)`;

  for (let i = 0; i < gridSize * gridSize; i++) {
    const cell = document.createElement('div');
    cell.classList.add('cell');
    cell.style.width = `${size}px`;
    cell.style.height = `${size}px`;
    cell.addEventListener('click', () => paintCell(cell));
    grid.appendChild(cell);
  }

  updateStats();
}

function paintCell(cell) {
  const color = colorPicker.value;
  const prevColor = cell.style.backgroundColor;
  const hasPrevColor = prevColor && prevColor !== '' && prevColor !== 'white' && prevColor !== 'rgb(255, 255, 255)';

  if (hasPrevColor) {
    try {
      const prev = rgbToHex(prevColor);
      colorCount[prev] = (colorCount[prev] || 1) - 1;
    } catch (e) {
      console.warn('Color anterior inválido:', prevColor);
    }
  }

  cell.style.backgroundColor = color;
  const colorKey = color.toLowerCase();
  colorCount[colorKey] = (colorCount[colorKey] || 0) + 1;

  updateStats();
}

function rgbToHex(rgb) {
  const rgbArr = rgb.match(/\d+/g);
  if (!rgbArr) throw new Error('Color no válido');
  return '#' + rgbArr.map(x => (+x).toString(16).padStart(2, '0')).join('');
}

function updateStats() {
  stats.innerHTML = '<h3>Conteo por color:</h3>';
  let total = 0;

  for (let color in colorCount) {
    if (colorCount[color] > 0) {
      total += colorCount[color];
      stats.innerHTML += `
        <div>
          <span style="display:inline-block;width:15px;height:15px;background:${color};border:1px solid #000;margin-right:5px;"></span>
          ${color}: ${colorCount[color]}
        </div>`;
    }
  }

  stats.innerHTML += `<hr><strong>Total de baldosas pintadas: ${total}</strong>`;
}

function clearColors() {
  const cells = document.querySelectorAll('.cell');
  cells.forEach(cell => (cell.style.backgroundColor = 'white'));
  colorCount = {};
  updateStats();
}

tileSizeSelect.addEventListener('change', createGrid);

// ✅ Validación + prompt de nombre de archivo
downloadBtn.addEventListener('click', () => {
  const cells = document.querySelectorAll('.cell');
  const hasColor = Array.from(cells).some(cell => {
    const bg = cell.style.backgroundColor;
    return bg && bg !== '' && bg !== 'white' && bg !== 'rgb(255, 255, 255)';
  });

  if (!hasColor) {
    alert('La grilla está vacía. Pintá al menos una baldosa antes de descargar.');
    return;
  }

  const fileName = prompt('¿Con qué nombre querés guardar el archivo?', 'diseño_pisos');
  if (!fileName) return; // Canceló

  html2canvas(capture).then((canvas) => {
    const link = document.createElement('a');
    link.download = `${fileName}.png`;
    link.href = canvas.toDataURL();
    link.click();
  });
});

// Cargar html2canvas
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
document.body.appendChild(script);

createGrid();
