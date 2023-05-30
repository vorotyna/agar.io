// Constructor for creating instances of the Blob class
function Blob(x, y, r) {
  // A vector object stores an x and y component for a position on the screen, etc.
  this.pos = createVector(x, y); // Position
  this.r = r; // Radius

  // A method to update the position of the blob based on the mouse position
  this.update = function() {
    let vel = createVector(mouseX - width / 2, mouseY - height / 2); // Creates a velocity vector using the mouse positions
    vel.setMag(3); // Sets the magnitude (length) of the vel vector to 3
    this.pos.add(vel); // Adds vel vector to the this.pos vector
  };

  // A method of the Blob class responsible for diplaying the blob on the canvas
  this.show = function() {
    fill(255); // Sets the fill color
    ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2); // Size of the ellipse
  };
}