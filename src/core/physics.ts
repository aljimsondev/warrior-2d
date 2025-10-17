import { Entity, EntityWithVelocity } from '../types/entity';

export class Physics {
  gravity = 0.1;
  acceleration = 2;
  deceleration = 0;
  constructor() {}

  applyGravity<T extends EntityWithVelocity>(entity: T) {
    // add gravity to the entity

    entity.velocity.y += this.gravity;
    entity.y += entity.velocity.y;
  }
  accelerate<T extends Entity>({
    entity,
    topSpeed,
  }: {
    entity: T;
    topSpeed: number;
  }) {
    // todo apply acceleration
    console.log(entity, topSpeed);
  }
}
