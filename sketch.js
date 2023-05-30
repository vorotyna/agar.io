let blob;

let blobs = []; // Holds an array of different blobs

function setup() {
  createCanvas(600, 600); // Canavas size
  blob = new Blob(width / 2, height / 2, 64);
  for (let i = 0; i < 10; i++) {
    blobs[i] = new Blob(random(width), random(height), 16); // Creates new blobs in array with random height, random width, and radius of 16
  }
}

function draw() {
  background(0);
  blob.show();
  blob.update();
  for (let i = 0; i < blobs.length; i++) {
    blobs[i].show();
  }
}