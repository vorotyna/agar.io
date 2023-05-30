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

  // A method handles the size of the Blob when it overlaps (i.e., 'eats') a small blob
  this.eats = function(other) {
    let d = p5.Vector.dist(this.pos, other.pos); // Calculate distance between Blob and other blob
    if (d < this.r + other.r) { // If the distance is less than the radius of both Blobs added, means they are overlapping (i.e., being eaten by Blob)
      let sum = PI * this.r * this.r + PI * other.r * other.r; // Sum of areas of both blobs (i.e., A = PI * r^2)
      this.r = sqrt(sum / PI); // Solve for new radius of Blob based on the area previously calculated
      return true;
    } else {
      return false;
    }
  };

  // A method of the Blob class responsible for diplaying the blob on the canvas
  this.show = function() {
    fill(255); // Sets the fill color
    ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2); // Size of the ellipse
  };
}