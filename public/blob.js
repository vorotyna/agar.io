// Constructor for creating instances of the Blob class
function Blob(x, y, r, colourR, colourG, colourB) {
  // A vector object stores an x and y component for a position on the screen, etc.
  this.pos = createVector(x, y); // Current position of Blob as a vector
  this.r = r; // Radius
  this.vel = createVector(0, 0); // Current velocity of Blob as a vector
  this.colourR = colourR; // Fill colour for Blob
  this.colourG = colourG; // Fill colour for Blob
  this.colourB = colourB; // Fill colour for Blob

  // A method to update the position of the blob based on the mouse position
  this.update = function() {
    let newVel = createVector(mouseX - width / 2, mouseY - height / 2); // Represents the velocity of the Blob based on current mouse position
    newVel.setMag(3); // Sets the magnitude (length) of the newVel vector to 3
    this.vel.lerp(newVel, 0.2); // Gradually adjusts (interpolates) the velocity of Blob towards the target velocity represented by newVel - resulting in smoother movement
    this.pos.add(this.vel); // Updates the position of Blob by adding velocity vector to the position vector
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

  // A method to contrain blob movement
  this.constrain = function() {
    blob.pos.x = constrain(blob.pos.x, -width, width);
    blob.pos.y = constrain(blob.pos.y, -height, height);
  };



  // A method of the Blob class responsible for diplaying the blob on the canvas
  this.show = function() {
    fill(colourR, colourG, colourB); // Sets the fill color
    ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2); // Size of the ellipse
  };
}