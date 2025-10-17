import { EntityWithAcceration, EntityWithVelocity } from '../types/entity';

export class Physics {
  gravity = 0.1;
  acceleration = 2;
  deceleration = 0;
  runAccelerationFactor = 0.05; // extra acceleration multiplier
  currentMaxSpeed = 1;
  constructor() {}

  applyGravity<T extends EntityWithVelocity>(entity: T) {
    // add gravity to the entity

    entity.velocity.y += this.gravity;
    entity.y += entity.velocity.y;
  }

  applyAcceleration({
    deltaTime,
    entity,
  }: {
    entity: EntityWithAcceration;
    deltaTime: number;
  }) {
    if (entity.velocity.x !== 0) {
      const speed = entity.speed;
      const topSpeed = entity.topSpeed;

      // Gradually accelerate
      entity.velocity.x += speed * (this.acceleration * deltaTime);

      // Smooth momentum buildup: if you keep holding the key, increase max speed slowly
      this.currentMaxSpeed += this.runAccelerationFactor * deltaTime;

      // Clamp to overall maxRunSpeed
      this.currentMaxSpeed = Math.min(this.currentMaxSpeed, topSpeed);

      // Clamp actual velocity
      if (Math.abs(entity.velocity.x) > this.currentMaxSpeed)
        entity.velocity.x = speed * this.currentMaxSpeed;
    } else {
      // decelerate
      if (Math.abs(entity.velocity.x) > 0.05) {
        const sign = Math.sign(entity.velocity.x);

        entity.velocity.x -= sign * (this.deceleration * deltaTime);

        // Prevent overshoot
        if (Math.sign(entity.velocity.x) !== sign) entity.velocity.x = 0;
      } else {
        entity.velocity.x = 0;
      }
    }
  }
}
