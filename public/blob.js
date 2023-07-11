// ----- CONSTRUCTOR FUNCTION FOR CREATING INSTANCES OF BLOB ----- //

function Blob(x, y, r, colourR, colourG, colourB) {
  // A vector object stores an x and y component for a position on the screen, etc.
  this.pos = createVector(x, y); // Current position of Blob as a vector
  this.r = r; // Radius
  this.vel = createVector(0, 0); // Current velocity of Blob as a vector
  this.colourR = colourR; // Fill colour for Blob
  this.colourG = colourG; // Fill colour for Blob
  this.colourB = colourB; // Fill colour for Blob
  this.isVisible = true; // Blob is visible (true)
  this.hasEaten = false; // Blob has eaten something (false)

  let magnitude = 2; // Initial magnitude (i.e., speed) of a new Blob

  // A method to update the position of the blob based on the mouse position
  this.update = function() {
    let newVel = createVector(mouseX - windowWidth / 2, mouseY - windowHeight / 2); // Represents the velocity of the Blob based on current mouse position

    // If Blob has eaten something, decrease the magnitude (i.e., slower) relative to the new radius
    if (this.hasEaten) {
      magnitude -= this.r / (this.r * 100); // Magnitude of 0.01
      this.hasEaten = false; // After changing magnitude, set this.hasEaten to false
    }

    newVel.setMag(magnitude); // Sets the magnitude (length) of the newVel vector
    this.vel.lerp(newVel, 0.2); // Gradually adjusts (interpolates) the velocity of Blob towards the target velocity represented by newVel - resulting in smoother movement
    this.pos.add(this.vel); // Updates the position of Blob by adding velocity vector to the position vector
  };


  // A method handles the size of the Blob when it overlaps (i.e., 'eats') a smaller blob
  this.eats = function(other) {
    let d = p5.Vector.dist(this.pos, other.pos); // Calculate distance between Blob and other blob    

    if (d < this.r + other.r / (this.r + other.r / this.r)) { // If the distance is less than the radius of both Blobs added, means they are overlapping (i.e., being eaten by Blob)
      // Check if this blob is larger and can eat the other blob
      let sizeDifference = this.r - other.r;

      if (sizeDifference > 3) {
        // If the radius is smaller or equal to 54
        if (this.r <= 54) {
          let sum = PI * this.r * this.r + PI * other.r * other.r; // Sum of areas of both blobs (i.e., A = PI * r^2)
          this.r = sqrt(sum / PI); // Solve for new radius of Blob based on the area previously calculated
        }
        this.hasEaten = true; // Set this.hasEaten to true
        return true;
      } else {
        return false;
      }
    }
  };


  // A method to contrain blob movement to the map size
  this.constrain = function() {
    blob.pos.x = constrain(blob.pos.x, -width, width);
    blob.pos.y = constrain(blob.pos.y, -height, height);
  };



  // A method of the Blob class responsible for diplaying the blob on the canvas
  this.show = function() {
    if (this.isVisible) {
      fill(colourR, colourG, colourB); // Sets the fill color
      ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2); // Size of the ellipse
    }
  };



  // A method of the Blob class responsible for hiding the blob on the canvas
  this.hide = function() {
    this.isVisible = false;
  };
}