let blob;

let blobs = []; // Holds an array of different blobs

function setup() {
  createCanvas(600, 600); // Canavas size
  blob = new Blob(width / 2, height / 2, 64);
  for (let i = 0; i < 50; i++) {
    blobs[i] = new Blob(random(width), random(height), 16); // Creates new blobs in array with random height, random width, and radius of 16
  }
}

function draw() {
  background(0);
  translate(width / 2 - blob.pos.x, width / 2 - blob.pos.y); // Translates the origin of the screen so that it appears that the screen (i.e., 'map') moves with the blob
  blob.show();
  blob.update();
  for (let i = 0; i < blobs.length; i++) {
    blobs[i].show();
  }
}