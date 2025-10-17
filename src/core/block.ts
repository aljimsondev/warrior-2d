import { Container, Graphics, Point } from 'pixi.js';

export class Block extends Container {
  velocity = new Point(0, 0);
  constructor() {
    super();
  }

  draw(width: number, height: number, color: string = 'green') {
    const obj = new Graphics();

    obj.rect(0, 0, width, height);
    obj.fill({
      color: color,
    });

    this.addChild(obj);
  }
}
