let fr;
let originX;
let originY;

let distFromMouseToOrigin;
let distFromCornerToOrigin;
let mouseToOriginRatio;

// cube properties
let noiseX;

let defaultWidth;
let cubeWidth;
let targetWidth;

let isHovering;
let triggerRadius;

// 2d settings
let isGlitching;
let currentShapeFunction;
let shapeWidth;

function setup() {
  // create a 3d canvas
  let canvas = createCanvas(windowWidth, windowHeight, WEBGL);
  canvas.parent("canvas");

  originX = windowWidth / 2;
  originY = windowHeight / 2;

  // framerate
  fr = 30;
  frameRate(fr);

  // 3d properties
  stroke(0, 255, 0);
  strokeWeight(2);
  noFill();
  imageMode(CENTER);

  // cube properties
  noiseX = 0;

  defaultWidth = 100;
  cubeWidth = defaultWidth;
  targetWidth = defaultWidth;

  isHovering = false;
  triggerRadius = cubeWidth / 2;

  // 2d properties
  rectMode(CENTER);
  isGlitching = false;
  currentShapeFunction = rect;
  shapeWidth = 0;
}

function draw() {
  background(0);
  calcMousePos();
  checkHover();
  
  // debug tool
  // logDistFromMouseToOrigin();

  push();
  drawCubes();
  pop();
  
  draw2D();
}

function calcMousePos() {
  distFromMouseToOrigin = dist(mouseX, mouseY, originX, originY);
  distFromCornerToOrigin = dist(width, height, originX, originY);

  // how far the mouse is from the center of the screen between 0 and 1
  mouseToOriginRatio = map(distFromMouseToOrigin, 0, distFromCornerToOrigin, 0, 1);
}

function checkHover() {
  if (distFromMouseToOrigin < triggerRadius) isHovering = true;
  else isHovering = false;
}

// logs distance from mouse to center of canvas every second
function logDistFromMouseToOrigin() {
  let distFromMouseToOrigin = dist(mouseX, mouseY, originX, originY);
  if (frameCount % fr == 0) console.log(distFromMouseToOrigin);
}

// primary function to draw cubes
function drawCubes() {
  // decide noise speed based on mouse pos
  let noiseIncrement = mouseToOriginRatio / 2;
  noiseX += noiseIncrement;
  // console.log(noiseDisturbance);

  let maxWidth = distFromCornerToOrigin * 50;

  // expand cube on hover, reassemble otherwise
  if (isHovering) {
    targetWidth = maxWidth;
    cubeWidth += easeTo(cubeWidth, targetWidth, 0.001);
  }
  else {
    targetWidth = defaultWidth;
    cubeWidth += easeTo(cubeWidth, targetWidth, 0.2);
  }

  for (let i = 0; i < 5; i++) {
    rotateX(frameCount / 120 + noiseX / 5);
    rotateY(frameCount / 120 + noiseX / 5);

    let noiseDisturbance = noise(noiseX + i);

    box(cubeWidth + i * 20 * (1 - mouseToOriginRatio) + noiseDisturbance * i * 20);
  }
  
}

// helper to ease values
function easeTo(currentVal, targetVal, multiplier) {
  return (targetVal - currentVal) * multiplier;
}

function draw2D() {
  let numShapes = 4;
  let shapeFunctions = [rect, ellipse, triangle];

  if (isHovering) {
    // decide if the shape should glitch and whether the shape should change
    if (random() < 0.1 && !isGlitching) {
      isGlitching = true;
      if (random() < 0.5) currentShapeFunction = random(shapeFunctions);
    }
    else if (random() < 0.5) isGlitching = false;
  }
  else isGlitching = false;
  
  // don't draw anything if the shape is glitching
  if (isGlitching) return;
  
  // draw the shape based on the current shape function
  for (let i = 0; i < fr; i += fr / numShapes) {

    if (isHovering) shapeWidth = exp(((frameCount + i) % fr) / 4);
    else shapeWidth += easeTo(shapeWidth, 0, 0.1);
    
    for (let j = 0; j < 6; j++) {
      if (isHovering) shapeWidth += j * 10;

      // triangles take different parameters
      if (currentShapeFunction == triangle) {
        let x1 = shapeWidth / 2;
        let y1 = shapeWidth * sqrt(3) / 4;

        let x2 = -shapeWidth / 2;
        let y2 = shapeWidth * sqrt(3) / 4;

        let x3 = 0;
        let y3 = -shapeWidth * sqrt(3) / 4;

        currentShapeFunction(x1, y1, x2, y2, x3, y3);
      }
      else currentShapeFunction(0, 0, shapeWidth);
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  originX = windowWidth / 2;
  originY = windowHeight / 2;
}
