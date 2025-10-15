import { Entity } from '../types/entity';
import { Block } from './block';

export class CollisionManager {
  collisionOffset = 2;
  constructor() {}
  checkForCollision<T extends Entity>({
    blocks,
    entity,
  }: {
    blocks: Block[];
    entity: T;
  }) {
    console.log(blocks, entity);
  }

  checkAABBCollision<T extends Entity, P extends Entity>(a: T, b: P) {
    return (
      a.y + a.height >= b.y && // a bottom side overlaps when b top side
      a.y <= b.height + b.y && // a top side overlaps bottom of b
      a.x <= b.x + b.width && // a left side overlaps right of b
      a.x + a.width >= b.x // a right side overlaps left of b
    );
  }
}
