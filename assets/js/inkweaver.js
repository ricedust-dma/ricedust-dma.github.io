let cellSize = 20;
let columns;
let rows;

let xOffset = 0;
let yOffset = 0;
let zOffset = 0;
let noiseScale = 0.1;

let flowField;
let flowFieldAngleOffset = 0;

let particles = [];
let maxParticleSpeed = 0.1;
let isWrappingParticles = true;

let strokeOpacity = 20;
let strokeColor = 0;
let isFading = false;

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("canvas");

  background(255)

  columns = floor(width / cellSize);
  rows = floor(height / cellSize);

  flowField = new Array(columns * rows);
}

// ===============================================
// FLOWFIELD AND PARTICLE
// ===============================================

function draw() {
  strokeWeight(1);
  stroke(strokeColor, strokeOpacity);

  if (isFading) background(255, 5);
  
  xOffset = 0;
  for (let x = 0; x < columns; x++) {
    yOffset = 0;
    for (let y = 0; y < rows; y++) {

      // create a noise based vector
      let angle = noise(xOffset, yOffset, zOffset) * TWO_PI + flowFieldAngleOffset;
      let vector = p5.Vector.fromAngle(angle);
      vector.setMag(1) // noramlize length to 0.1

      // store vector in flowfield array
      let index = (y * columns) + x;
      flowField[index] = vector;

      yOffset += noiseScale;
      zOffset += 0.00001;
    }
    xOffset += noiseScale

    for (let i = 0; i < particles.length; i++) {
      particles[i].follow(flowField);
      isWrappingParticles && particles[i].keepOnScreen();
      particles[i].draw();
      particles[i].update();

    }
  }
}

// ===============================================
// MOUSE AND KEYBOARD INPUT
// ===============================================

function mouseDragged() {
  // keep adding particles while the mouse is down
  particles.push(new Particle(mouseX, mouseY));
}

function mouseReleased() {
  // clear particles when mouse is released
  particles = [];
}

function keyPressed() {
  switch (keyCode) {
    // 1, 2, and 3 control particle speed
    case 49: snSetParticleSpeed(0.01); break;
    case 50: snSetParticleSpeed(0.1); break;
    case 51: snSetParticleSpeed(1); break;
    // Q, W, and E change the noise scale
    case 81: snSetNoiseScale(1); break;
    case 87: snSetNoiseScale(0.1); break;
    case 69: snSetNoiseScale(0.01); break;
    // A, S and D change the opacity
    case 65: snSetOpacity(5); break;
    case 83: snSetOpacity(20); break;
    case 68: snSetOpacity(100); break;
    // X to clear canvas and reset brushes
    case 88: clearCanvas(); break;
    // R to reset brushes
    case 82: resetBrushes(); break;
    // C to toggle eraser
    case 67: toggleEraser(); break;
    // Z to toggle whether particles wrap back around
    case 90: toggleParticleWrapping(); break;
    // F to toggle trail fading
    case 70: toggleFading(); break;
    // arrow keys set flowfield direction
    case 37: offsetFlowFieldAngle(0); break; // left
    case 38: offsetFlowFieldAngle(HALF_PI); break; // up
    case 39: offsetFlowFieldAngle(PI); break; // right
    case 40: offsetFlowFieldAngle(PI + HALF_PI); break; // down
  }
}

function snSetParticleSpeed(speed) { maxParticleSpeed = speed; }
function snSetNoiseScale(scale) { noiseScale = scale; }
function snSetOpacity(opacity) { strokeOpacity = opacity; }

function clearCanvas() { background(255); resetBrushes(); particles = []; }
function resetBrushes() { 
  snSetParticleSpeed(0.1);
  snSetNoiseScale(0.1);
  snSetOpacity(20);
  strokeColor = 0;
  isWrappingParticles = true;
  isFading = false;
  flowFieldAngleOffset = 0;
  
}
function toggleEraser() { strokeColor = strokeColor == 0 ? 255 : 0; }
function toggleParticleWrapping() { isWrappingParticles = !isWrappingParticles; }
function toggleFading() { isFading = !isFading; }
function offsetFlowFieldAngle(offsetAngle) { flowFieldAngleOffset = offsetAngle; }

// ===============================================
// PARTICLE LOGIC
// ===============================================

class Particle {
  constructor(x, y) {
    this.position = createVector(x, y);
    this.velocity = createVector(0, 0);
    this.acceleration = createVector(0, 0);
    this.prevPosition = this.position.copy();
  }

  update() {
    this.velocity.add(this.acceleration);
    this.velocity.limit(maxParticleSpeed);

    this.position.add(this.velocity);
    this.acceleration.mult(0);
  }

  applyForce(force) {
    this.acceleration.add(force);
  }

  draw() {
    line(this.position.x, this.position.y, this.prevPosition.x, this.prevPosition.y);
    this.updatePrevPosition();
  }

  updatePrevPosition() {
    this.prevPosition.x = this.position.x;
    this.prevPosition.y = this.position.y;
  }

  keepOnScreen() {
    if (this.position.x > width) {
      this.position.x = 0;
      this.updatePrevPosition();
    }
    if (this.position.x < 0) {
      this.position.x = width;
      this.updatePrevPosition();
    }
    if (this.position.y < 0) { 
      this.position.y = height;
      this.updatePrevPosition();
    } 
    if (this.position.y > height) {
      this.position.y = 0;
      this.updatePrevPosition();
    }
  }

  follow(vectors) {
    let x = floor(this.position.x / cellSize);
    let y = floor(this.position.y / cellSize);
    let index = (y * columns) + x;
    let force = vectors[index];
    this.applyForce(force);
  }
}

// ===============================================
// WINDOW RESIZING
// ===============================================

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(255);
}