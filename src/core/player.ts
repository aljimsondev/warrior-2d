import { Container, Graphics, Point } from 'pixi.js';

export class Player extends Container {
  velocity: Point = new Point(0, 0);

  // attributes
  jumpPower: number = 5.3;
  speed: number = 1;
  isGrounded: boolean = true;
  topSpeed = 2;

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
    if (this.isGrounded) {
      this.velocity.y = -this.jumpPower;
      this.isGrounded = false;
    }
  }
}
