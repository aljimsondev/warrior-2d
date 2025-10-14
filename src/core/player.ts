import { Container, Graphics, Point } from 'pixi.js';

export class Player extends Container {
  velocity: Point = new Point(0, 0);

  // attributes
  jumpPower: number = 20;
  speed: number = 5;

  constructor() {
    super();
  }

  draw(width: number, height: number) {
    const obj = new Graphics();

    obj.rect(this.x, this.y, width, height);
    obj.fill({ color: 'red' });

    this.addChild(obj);
  }

  update() {
    // player update goes here
    this.y += this.velocity.y;
    this.x += this.velocity.x;
  }
  //player movements
  moveLeft() {
    this.velocity.x = -this.speed;
  }
  moveRight() {
    this.velocity.x = this.speed;
  }
  stopMovement() {
    this.velocity.x = 0;
  }
  jump() {
    this.velocity.y = -this.jumpPower;
  }
}
