import { Entity } from '../types/entity';

export class Physics {
  gravity = 0.4;
  acceleration = 2;
  deceleration = 0;
  constructor() {}

  applyGravity<T extends Entity>(entity: T) {
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
