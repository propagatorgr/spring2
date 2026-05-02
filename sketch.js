// ================== ΣΤΑΘΕΡΕΣ ==================
let g = 10;                // m/s^2
let scale = 100;           // 1 m = 100 px
let naturalLength = 1.8;   // m

// ================== ΜΕΤΑΒΛΗΤΕΣ ==================
let floorY, naturalY, eqY, y;
let t = 0, dt = 0.02;
let running = true;

let m = 1, k = 20, A = 0.2;
let T, omega;
let E, K, U, umax;

let mSlider, kSlider, ASlider;
let playButton;

// ================== SETUP ==================
function setup() {
  createCanvas(windowWidth * 0.95, 450);
  floorY = height - 40;
  createUI();
  updateSystem();
}

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

  if (running) {
    t += dt;
  }

  y = eqY + A * scale * sin(TWO_PI * t / T);

  let x = (y - eqY) / scale;
  U = 0.5 * k * x * x;
  K = E - U;

  drawReferenceLines();
  drawSpring();
  drawMass();
  drawFloor();
  drawEnergyPanel();
  drawReadout();
}

// ================== ΣΧΕΔΙΑΣΗ ==================
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

  beginShape();
  vertex(width / 2, floorY);
  for (let i = 1; i < coils; i++) {
    let yy = floorY - (i / coils) * len;
    let xx = width / 2 + (i % 2 ? -14 : 14);
    vertex(xx, yy);
  }
  vertex(width / 2, y);
  endShape();
}

function drawMass() {
  rectMode(CENTER);
  fill(100, 150, 255);
  stroke(255);
  rect(width / 2, y, 60, 40, 8);
}

function drawFloor() {
  strokeWeight(3);
  stroke(255);
  line(0, floorY, width, floorY);
  strokeWeight(1);
}

// ================== ΕΝΕΡΓΕΙΑΚΟ PANEL ==================
function drawEnergyPanel() {
  let x0 = width - 260;
  let y0 = 40;

  noStroke();
  fill(20);
  rect(x0, y0, 220, 280, 10);

  fill(255);
  textAlign(CENTER);
  textSize(14);
  text('Ενεργειακή Ανάλυση', x0 + 110, y0 + 20);

  let baseY = y0 + 210;
  let maxH = 140;
  let scaleE = maxH / E;

  fill(220, 80, 80);
  rect(x0 + 50, baseY - U * scaleE, 30, U * scaleE);

  fill(80, 150, 255);
  rect(x0 + 100, baseY - K * scaleE, 30, K * scaleE);

  noFill();
  stroke(255);
  rect(x0 + 50, baseY - E * scaleE, 80, E * scaleE);

  noStroke();
  fill(200);
  text('U', x0 + 65, baseY + 15);
  text('K', x0 + 115, baseY + 15);
  text('E', x0 + 90, baseY - E * scaleE - 8);

  textAlign(LEFT);
  textSize(12);
  text(`U = ${U.toFixed(2)} J`, x0 + 20, y0 + 230);
  text(`K = ${K.toFixed(2)} J`, x0 + 20, y0 + 250);
  text(`E = ${E.toFixed(2)} J`, x0 + 20, y0 + 270);
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
