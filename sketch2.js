// ================== ΣΤΑΘΕΡΕΣ ==================
let g = 10;                // m/s^2
let scale = 100;           // 1 m = 100 px
let naturalLength = 1.8;   // m
let energyPanelWidth = 260;
console.log("tiropites");
// ================== ΜΕΤΑΒΛΗΤΕΣ ==================
let floorY, naturalY, eqY, y;
let t = 0, dt = 0.02;
let running = true;

let m = 1, k = 20, A = 0.2;
let T, omega;
let E, K, U, umax;

let mSlider, kSlider, ASlider, playButton;

// ================== SETUP ==================
function setup() {
  createCanvas(windowWidth * 0.95, 450);
  floorY = height - 40;
  createUI();
  updateSystem();
}

// ================== RESPONSIVE ==================
function windowResized() {
  resizeCanvas(windowWidth * 0.95, 450);
  floorY = height - 40;
}

// ================== UI ==================
function createUI() {
  const controls = select('#controls');

  mSlider = createSlider(0.5, 5, 1, 0.1);
  addControl(controls, 'Μάζα m (kg)', mSlider);

  kSlider = createSlider(5, 50, 20, 1);
  addControl(controls, 'Σταθερά ελατηρίου k (N/m)', kSlider);

  ASlider = createSlider(0.05, 0.5, 0.2, 0.01);
  addControl(controls, 'Πλάτος A (m)', ASlider);

  playButton = createButton('⏸ Pause');
  playButton.mousePressed(togglePlay);
  playButton.parent(controls);

  let readout = createDiv('');
  readout.id('readout');
  readout.parent(controls);
}

function addControl(parent, text, slider) {
  let box = createDiv().class('control').parent(parent);
  createElement('label', text).parent(box);
  slider.parent(box);
}

function togglePlay() {
  running = !running;
  playButton.html(running ? '⏸ Pause' : '▶ Play');
}

// ================== ΦΥΣΙΚΗ ==================
function updateSystem() {
  m = mSlider.value();
  k = kSlider.value();
  A = ASlider.value();

  omega = sqrt(k / m);
  T = TWO_PI / omega;

  E = 0.5 * k * A * A;
  umax = omega * A;

  naturalY = floorY - naturalLength * scale;
  let deltaL = (m * g) / k;
  eqY = naturalY + deltaL * scale;
}

// ================== DRAW ==================
function draw() {
  background(0);
  updateSystem();

  if (running) t += dt;

  y = eqY + A * scale * sin(TWO_PI * t / T);
  let x = (y - eqY) / scale;

  U = 0.5 * k * x * x;
  K = E - U;

  // ---- ΠΕΡΙΟΧΗ ΤΑΛΑΝΤΩΣΗΣ (CLIP) ----
  beginSimulationArea();
  drawReferenceLines();
  drawSpring();
  drawMass();
  drawFloor();
  endSimulationArea();

  // ---- ENERGY PANEL ----
  drawEnergyPanel();

  // ---- READOUT ----
  drawReadout();
}

// ================== CLIP AREA ==================
function beginSimulationArea() {
  drawingContext.save();
  drawingContext.beginPath();
  drawingContext.rect(0, 0, width - energyPanelWidth, height);
  drawingContext.clip();
}

function endSimulationArea() {
  drawingContext.restore();
}

// ================== ΤΑΛΑΝΤΩΣΗ ==================
function drawReferenceLines() {
  drawingContext.setLineDash([6, 6]);

  stroke(150);
  line(0, naturalY, width, naturalY);

  stroke(0, 200, 0);
  line(0, eqY, width, eqY);

  stroke(200, 0, 0);
  line(0, eqY - A * scale, width, eqY - A * scale);
  line(0, eqY + A * scale, width, eqY + A * scale);

  drawingContext.setLineDash([]);
}

function drawSpring() {
  stroke(255);
  noFill();

  let coils = 16;
  let len = floorY - y;
  let cx = (width - energyPanelWidth) / 2;

  beginShape();
  vertex(cx, floorY);
  for (let i = 1; i < coils; i++) {
    let yy = floorY - (i / coils) * len;
    let xx = cx + (i % 2 ? -14 : 14);
    vertex(xx, yy);
  }
  vertex(cx, y);
  endShape();
}

function drawMass() {
  let cx = (width - energyPanelWidth) / 2;
  rectMode(CENTER);
  fill(100, 150, 255);
  stroke(255);
  rect(cx, y, 60, 40, 8);
}

function drawFloor() {
  strokeWeight(3);
  stroke(255);
  line(0, floorY, width - energyPanelWidth, floorY);
  strokeWeight(1);
}

// ================== ENERGY PANEL ==================
function drawEnergyPanel() {

  // PANEL ΠΑΝΩ ΔΕΞΙΑ - ΣΤΑΘΕΡΟ
  let x0 = width - energyPanelWidth + 20;
  let y0 = 10;
  let panelH = 320;

  noStroke();
  fill(20);
  rect(x0 - 20, y0 - 10, energyPanelWidth - 20, panelH, 10);

  fill(255);
  textAlign(CENTER);
  textSize(14);
  text('Ενεργειακή Ανάλυση', x0 + 90, y0 + 15);

  let baseY = y0 + 250;
  let maxH = 150;
  let scaleE = maxH / E;

  // U
  fill(220, 80, 80);
  rect(x0 + 10, baseY - U * scaleE, 30, U * scaleE);

  // K
  fill(80, 150, 255);
  rect(x0 + 60, baseY - K * scaleE, 30, K * scaleE);

  // E πλαίσιο
  noFill();
  stroke(255);
  rect(x0 + 10, baseY - E * scaleE, 80, E * scaleE);

  noStroke();
  fill(200);
  textSize(12);
  text('U', x0 + 25, baseY + 15);
  text('K', x0 + 75, baseY + 15);
  text('E', x0 + 50, baseY - E * scaleE - 10);

  textAlign(LEFT);
  text(`U = ${U.toFixed(2)} J`, x0, baseY + 40);
  text(`K = ${K.toFixed(2)} J`, x0, baseY + 60);
  text(`E = ${E.toFixed(2)} J`, x0, baseY + 80);
}

// ================== READOUT ==================
function drawReadout() {
  select('#readout').html(
    `m = ${m.toFixed(2)} kg<br>
     k = ${k.toFixed(1)} N/m<br>
     A = ${A.toFixed(2)} m<br>
     T = ${T.toFixed(2)} s<br>
     ω = ${omega.toFixed(2)} rad/s<br>
     uₘₐₓ = ${umax.toFixed(2)} m/s<br>
     E = ${E.toFixed(2)} J`
  );
}
