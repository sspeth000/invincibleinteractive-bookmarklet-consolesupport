(() => {
  "use strict";
  class InvinciblePlayer {
    constructor(ctx) {
      this.ctx = ctx;
      this.x = 0;
      this.y = 0;
      this.vx = 0;
      this.vy = 0;
      this.acceleration = 1800;
      this.braking = 1400;
      this.normalSpeed = 260;
      this.boostSpeed = 520;
      this.lean = 0;
      this.leanSmoothing = 9;
      this.maxLean = 0.42;
      this.image = new Image();
      this.image.src = "https://raw.githubusercontent.com/sspeth000/invincibleinteractive-bookmarklet-consolesupport/main/placeholder.webp";
    }
    get speed() { return Math.round(Math.hypot(this.vx, this.vy)); }
    update(inputX, inputY, boosting, dt) {
      const maxSpeed = boosting ? this.boostSpeed : this.normalSpeed;
      const targetVx = inputX * maxSpeed;
      const targetVy = inputY * maxSpeed;
      const moveToward = (value, target, amount) =>
        value < target ? Math.min(value + amount, target) :
        value > target ? Math.max(value - amount, target) : target;
      const rate = (inputX || inputY) ? this.acceleration : this.braking;
      this.vx = moveToward(this.vx, targetVx, rate * dt);
      this.vy = moveToward(this.vy, targetVy, rate * dt);
      this.x += this.vx * dt;
      this.y += this.vy * dt;

      // Lean mostly with horizontal motion; vertical motion contributes less.
      const horizontalLean = (this.vx / maxSpeed) * this.maxLean;
      const verticalLean = (this.vy / maxSpeed) * this.maxLean * 0.22;
      const targetLean = Math.max(-this.maxLean, Math.min(this.maxLean, horizontalLean + verticalLean));
      const blend = 1 - Math.exp(-this.leanSmoothing * dt);
      this.lean += (targetLean - this.lean) * blend;
    }
    draw(width, height) {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(this.lean);
      if (this.image.complete && this.image.naturalWidth) {
        const h = Math.min(128, Math.max(72, height * 0.16));
        const w = h * this.image.naturalWidth / this.image.naturalHeight;
        ctx.drawImage(this.image, -w / 2, -h / 2, w, h);
      } else {
        ctx.fillStyle = "#155da4";
        ctx.fillRect(-12, -15, 24, 34);
        ctx.fillStyle = "#e9b991";
        ctx.beginPath(); ctx.arc(0, -25, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#c52d37";
        ctx.beginPath(); ctx.moveTo(-10, -12); ctx.lineTo(-29, 5); ctx.lineTo(-22, 27); ctx.lineTo(-8, 12); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
  }
  window.InvinciblePlayer = InvinciblePlayer;
})();