let isMouseDown = false;
let totalTiles = 0;

document.addEventListener("mousedown", () => isMouseDown = true);
document.addEventListener("mouseup", () => isMouseDown = false);

/* ================= GENERAR GRILLA ================= */
function generateGrid() {
  const tileSize = parseFloat(document.getElementById("tileSize").value);

  const sections = [
    { w: parseFloat(w1.value), h: parseFloat(h1.value) },
    { w: parseFloat(w2.value), h: parseFloat(h2.value) },
    { w: parseFloat(w3.value), h: parseFloat(h3.value) },
    { w: parseFloat(w4.value), h: parseFloat(h4.value) }
  ].filter(s => s.w && s.h);

  if (sections.length === 0) return;

  const maxWidth = Math.max(...sections.map(s => s.w));
  const cols = Math.ceil(maxWidth / tileSize);

  const grid = document.getElementById("grid");
  grid.innerHTML = "";
  grid.style.gridTemplateColumns = `repeat(${cols}, 22px)`;

  totalTiles = 0;

  sections.forEach(section => {
    const sectionRows = Math.ceil(section.h / tileSize);
    const sectionCols = Math.ceil(section.w / tileSize);

    for (let r = 0; r < sectionRows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");

        if (c < sectionCols) {
          totalTiles++;
          cell.addEventListener("mousedown", paintCell);
          cell.addEventListener("mouseover", function () {
            if (isMouseDown) paintCell.call(this);
          });
        } else {
          cell.style.visibility = "hidden";
        }

        grid.appendChild(cell);
      }
    }
  });

  document.getElementById("tileCount").innerText =
    "Baldosas totales: " + totalTiles;

  updateColorStats();
}

/* ================= PINTAR ================= */
function paintCell() {
  const selectedColor = document.getElementById("colorPicker").value;

  if (this.style.backgroundColor === selectedColor) {
    this.style.backgroundColor = "white";
  } else {
    this.style.backgroundColor = selectedColor;
  }

  updateColorStats();
}

/* ================= LIMPIAR ================= */
function clearGrid() {
  document.querySelectorAll(".cell").forEach(cell => {
    if (cell.style.visibility !== "hidden") {
      cell.style.backgroundColor = "white";
    }
  });
  updateColorStats();
}

/* ================= ESTADÍSTICAS ================= */
function updateColorStats() {
  const tileSize = parseFloat(document.getElementById("tileSize").value);
  const tileArea = tileSize * tileSize;

  const cells = document.querySelectorAll(".cell");
  const colorMap = {};

  cells.forEach(cell => {
    if (cell.style.visibility === "hidden") return;

    const color = cell.style.backgroundColor;
    if (color && color !== "white") {
      if (!colorMap[color]) colorMap[color] = 0;
      colorMap[color]++;
    }
  });

  const statsContainer = document.getElementById("colorStats");
  statsContainer.innerHTML = "";

  for (let color in colorMap) {
    const count = colorMap[color];
    const m2 = (count * tileArea).toFixed(2);

    const line = document.createElement("p");
    line.innerHTML =
      `<span style="display:inline-block;width:15px;height:15px;background:${color};margin-right:6px;"></span>
       ${count} baldosas — ${m2} m²`;

    statsContainer.appendChild(line);
  }
}

/* ================= PDF 1 HOJA (HORIZONTAL) ================= */
async function exportPDF() {
  const jsPDF = window.jspdf.jsPDF;
  const grid = document.getElementById("grid");
  const resumen = document.querySelector(".stats-export");

  const canvasGrid = await html2canvas(grid, { scale: 3, useCORS: true });
  const canvasResumen = await html2canvas(resumen, { scale: 2, useCORS: true });

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "legal"
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;
  const usableWidth = pageWidth - margin * 2;
  const usableHeight = pageHeight - margin * 2;

  // Grilla
  let gridWidth = usableWidth;
  let gridHeight = canvasGrid.height * gridWidth / canvasGrid.width;
  if (gridHeight > usableHeight * 0.9) {
    gridHeight = usableHeight * 0.9;
    gridWidth = canvasGrid.width * gridHeight / canvasGrid.height;
  }

  const posX = (pageWidth - gridWidth) / 2;
  const posY = margin;

  pdf.addImage(canvasGrid.toDataURL("image/png"), "PNG", posX, posY, gridWidth, gridHeight);

  // Resumen
  const resumenWidth = usableWidth * 0.6;
  let resumenHeight = canvasResumen.height * resumenWidth / canvasResumen.width;
  const maxResumenHeight = pageHeight - margin - (posY + gridHeight + 5);
  if (resumenHeight > maxResumenHeight) resumenHeight = maxResumenHeight;

  pdf.addImage(
    canvasResumen.toDataURL("image/png"),
    "PNG",
    margin,
    posY + gridHeight + 5,
    resumenWidth,
    resumenHeight
  );

  pdf.save("plano-horizontal-grande.pdf");
}

/* ================= PDF VARIAS HOJAS (HORIZONTAL) ================= */
async function exportPDFMulti() {
  const jsPDF = window.jspdf.jsPDF;
  const element = document.getElementById("exportArea");

  const canvas = await html2canvas(element, { scale: 2, useCORS: true });
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 10;

  const imgWidth = pageWidth - 2 * margin;
  const imgHeight = canvas.height * imgWidth / canvas.width;

  let heightLeft = imgHeight;
  let position = margin;

  pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
  heightLeft -= (pageHeight - 2 * margin);

  while (heightLeft > 0) {
    position = heightLeft - imgHeight + margin;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
    heightLeft -= (pageHeight - 2 * margin);
  }

  pdf.save("plano-varias-hojas.pdf");
}