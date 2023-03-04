// image references
let blissImg;

let bonziBuddyImg;
let clippyImg;
let taskFailedImg;
let solitaireImg;
let virusImg;
let controlPanelImg;
let internetExplorerImg;
let microsoftWordImg;

let allImages; // array of all images
let draggablePool; // array of draggable objects not currently drawn
let drawStack; // stack of draggable objects currently onscreen

// currently selected draggable
let selectedDraggable;

// flags
let isTrailing;
let isColorShifting;

function preload() {
  blissImg = loadImage("assets/img/bliss.jpg");
  
  bonziBuddyImg = loadImage("assets/img/bonzi-buddy.png");
  clippyImg = loadImage("assets/img/clippy.png");
  taskFailedImg = loadImage("assets/img/task-failed.jpg");
  solitaireImg = loadImage("assets/img/solitaire.jpg");
  virusImg = loadImage("assets/img/virus.jpg");
  controlPanelImg = loadImage("assets/img/control-panel.png");
  internetExplorerImg = loadImage("assets/img/internet-explorer.png");
  microsoftWordImg = loadImage("assets/img/microsoft-word.png");
}

class Draggable {
  constructor(img, x, y) {
      this.img = img;
      this.x = x;
      this.y = y;
  }
}

function setup() {
  let canvas = createCanvas(windowWidth, windowHeight);
  canvas.parent("canvas");

  frameRate(30);
  scaleWallpaper();

  imageMode(CENTER);
  rectMode(CENTER);

  // initialize arrays
  allImages = [bonziBuddyImg, clippyImg, taskFailedImg, solitaireImg, virusImg, controlPanelImg, internetExplorerImg, microsoftWordImg];
  draggablePool = [];
  allImages.forEach(image => draggablePool.push(new Draggable(image,  width / 2, height / 2)));
  drawStack = [];

  // assign flags
  isTrailing = false;
  isColorShifting = false;
}

function draw() {
  if (!isTrailing) {
    // only clear background if object trailing is disabled
    background(0);
    image(blissImg, width / 2, height / 2); 
  }

  for (draggable of drawStack) {
    push();
    translate(draggable.x, draggable.y, 0);
    if (isColorShifting) tint(getRainbow(0)); 
    image(draggable.img, 0, 0);
    pop();
  }
}

function getRainbow(seed) {
  noiseSeed(seed);
  let red = map(noise(frameCount / 30), 0, 1, 0, 255);
  noiseSeed(seed + 1);
  let green = map(noise(frameCount / 30), 0, 1, 0, 255);
  noiseSeed(seed + 2);
  let blue = map(noise(frameCount / 30), 0, 1, 0, 255);

  return color(red, green, blue);
}

// ====================================================
// INPUT AND DRAG INTERACTION
// ====================================================

function keyPressed() {
  switch (keyCode) {
    case 32: // spacebar
      // console.log("Spacebar down");
      drawRandomDraggable();
      break;
    case BACKSPACE:
      returnDraggableToPool();
      break;
    case 84:
      // console.log("T down");
      isTrailing = !isTrailing; // toggle object trail
      break;
    case 67:
      // console.Log("C down");
      isColorShifting = !isColorShifting;
      break;
  }
}

function drawRandomDraggable() {
  if (draggablePool.length) {
    let randomIndex = floor(random() * draggablePool.length);
    let draggableToDraw = draggablePool.splice(randomIndex, 1)[0];

    drawStack.push(draggableToDraw);
    // console.log(draggablePool);
  }
}

function returnDraggableToPool() {
  if (drawStack.length) {
    draggablePool.push(drawStack.pop());
  }
  else {
    background(0);
    image(blissImg, width / 2, height / 2); 
  }
}

// ====================================================
// DRAGGING AND LAYER SELECTION
// ====================================================

function mousePressed() {
  // console.log("Mouse down");
  selectedDraggable = getTopDraggable();
  if (selectedDraggable) {
    // move selected draggable to the front
    let selectedDraggableIndex = drawStack.indexOf(selectedDraggable);
    drawStack.push(drawStack.splice(selectedDraggableIndex, 1)[0]);
  }
}

function mouseDragged() {
  if (selectedDraggable) {
    selectedDraggable.x = mouseX;
    selectedDraggable.y = mouseY;
  }
}

function getTopDraggable() {
  // find the topmost draggable that the mouse is hovering
  for (let i = drawStack.length - 1; i >=0; i--) {
    if (mouseIsHovering(drawStack[i])) return drawStack[i];
  }
  return null;
}

function mouseIsHovering(draggable) {
  let halfWidth = draggable.img.width / 2;
  let halfHeight = draggable.img.height / 2;

  let leftBound = draggable.x - halfWidth;
  let rightBound = draggable.x + halfWidth;
  let topBound = draggable.y - halfHeight;
  let bottomBound = draggable.y + halfHeight;

  // console.log(leftBound + " " + rightBound + " " + topBound + " " + bottomBound);
  // console.log(mouseX + " " + mouseY);
  return mouseX > leftBound && mouseX < rightBound && mouseY > topBound && mouseY < bottomBound;
}

// ====================================================
// RESIZING CANVAS AND BACKGROUND
// ====================================================

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  scaleWallpaper();
}

function scaleWallpaper() {
  blissImg.resize(windowWidth, 0);
  if (blissImg.height > windowHeight) blissImg.resize(0, windowHeight);
}
