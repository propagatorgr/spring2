// ===== ΣΤΑΘΕΡΕΣ =====
let g = 10;
let scale = 100;
let naturalLength = 1.8;

// ===== ΜΕΤΑΒΛΗΤΕΣ =====
let canvas;
let floorY, naturalY, eqY, y;
let t = 0, dt = 0.02, T;

let m = 1, k = 20, A = 0.2, E = 0;
let mSlider, kSlider, ASlider;

function setup() {
  canvas = createCanvas(windowWidth * 0.95, 450);
  canvas.parent(document.body);

  floorY = height - 40;

  createUI();
  updateSystem();
}

function windowResized() {
  resizeCanvas(windowWidth * 0.95, 450);
  floorY = height - 40;
}

function createUI() {
  const controls = select('#controls');

  mSlider = createSlider(0.5, 5, 1, 0.1);
  addControl(controls, 'Μάζα m (kg)', mSlider);

  kSlider = createSlider(5, 50, 20, 1);
  addControl(controls, 'Σταθερά ελατηρίου k (N/m)', kSlider);

  ASlider = createSlider(0.05, 0.5, 0.2, 0.01);
  addControl(controls, 'Πλάτος A (m)', ASlider);

  let readout = createDiv('');
  readout.id('readout');
  readout.parent(controls);
}

function addControl(parent, text, slider) {
  let wrapper = createDiv();
  wrapper.class('control');
  wrapper.parent(parent);

  let label = createElement('label', text);
  label.parent(wrapper);
  slider.parent(wrapper);
}

function updateSystem() {
  m = mSlider.value();
  k = kSlider.value();
  A = ASlider.value();

  T = TWO_PI * sqrt(m / k);
  E = 0.5 * k * A * A;

  naturalY = floorY - naturalLength * scale;
  let deltaL = (m * g) / k;
  eqY = naturalY + deltaL * scale;
}

function draw() {
  background(0);
  updateSystem();

  y = eqY + A * scale * sin(TWO_PI * t / T);
  t += dt;

  drawLines();
  drawSpring();
  drawMass();
  drawFloor();
  drawReadout();
}

function drawLines() {
  drawingContext.setLineDash([6, 6]);

  stroke(180);
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

function drawReadout() {
  select('#readout').html(
    `m = ${m.toFixed(2)} kg<br>` +
    `k = ${k.toFixed(1)} N/m<br>` +
    `A = ${A.toFixed(2)} m<br>` +
    `T = ${T.toFixed(2)} s<br>` +
    `E = ${E.toFixed(2)} J`
  );
}
