import { Container, Graphics, Point } from 'pixi.js';

export class Block extends Container {
  velocity = new Point(0, 0);
  constructor() {
    super();
  }

  draw(width: number, height: number) {
    const obj = new Graphics();

    obj.rect(0, 0, width, height);
    obj.fill({
      color: 'green',
    });

    this.addChild(obj);
  }
}
