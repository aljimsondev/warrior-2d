import { Container, Graphics } from 'pixi.js';

export class Block extends Container {
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
