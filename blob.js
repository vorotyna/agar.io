// Constructor for creating instances of the Blob class
function Blob() {
  // A vector object stores an x and y component for a position on the screen, etc.
  this.pos = createVector(width / 2, height / 2); // Position
  this.r = 64; // Radius

  // A method of the Blob class responsible for siplaying the blob on the canvas
  this.show = function() {
    fill(255); // Sets the fill color
    ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2); // Size of the ellipse
  };
}