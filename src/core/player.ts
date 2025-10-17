import { AnimatedSprite, Container, Graphics, Point } from 'pixi.js';
import {
  EntityTexture,
  PlayerAnimationState,
  PlayerOptions,
} from '../types/entity';
import { AnimationHelper } from './animation';

const animHelper = new AnimationHelper();

export class Player extends Container {
  velocity: Point = new Point(0, 0);

  // attributes
  jumpPower: number = 5.3;
  speed: number = 1;
  isGrounded: boolean = true;
  topSpeed = 2;
  textures: EntityTexture;
  animationState: PlayerAnimationState = 'IDLE';
  sprite!: AnimatedSprite;
  hitbox = {
    x: 0,
    y: 0,
    width: 30,
    height: 50,
    offset: 5,
  };
  // hitbox sides
  sides = {
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  };

  constructor({ textures }: PlayerOptions) {
    super();
    this.textures = textures;
  }

  draw() {
    const texture = this.textures[this.animationState];

    const frames = animHelper.getAnimationFrames(texture);

    this.sprite = new AnimatedSprite(frames, true);

    // update hitbox position
    this.hitbox.x = this.sprite.width * 0.5 - this.hitbox.width * 0.5;
    this.hitbox.y =
      this.sprite.height - this.hitbox.height - this.hitbox.offset;

    this.sprite.play();

    this.sprite.animationSpeed = 0.1;

    this.addChild(this.sprite);
  }
  setHitboxSides() {
    this.sides.left = this.x - this.hitbox.x;
  }

  getGlobalHixboxPosition() {
    const globalPosition = this.toGlobal({
      x: this.hitbox.x,
      y: this.hitbox.y,
    });

    return { ...this.hitbox, x: globalPosition.x, y: globalPosition.y };
  }

  setAnimationState(state: PlayerAnimationState) {
    if (state === this.animationState) return;

    this.animationState = state;
    const newTexture = this.textures[state];

    const newFrames = animHelper.getAnimationFrames(newTexture);

    this.sprite.textures = newFrames;

    // ✅ restart animation
    this.sprite.gotoAndPlay(0);
  }

  update() {
    // player update goes here
    this.x += this.velocity.x;
  }
  //player movements
  moveLeft() {
    this.velocity.x = -this.speed;
    this.setAnimationState('RUN');
  }
  moveRight() {
    this.velocity.x = this.speed;
    this.setAnimationState('RUN');
  }
  stopMovement() {
    this.velocity.x = 0;
    this.setAnimationState('IDLE');
  }
  jump() {
    if (this.isGrounded) {
      this.velocity.y = -this.jumpPower;
      this.isGrounded = false;
      this.setAnimationState('JUMP');
    }
  }

  drawDebugBox() {
    const box = new Graphics();

    box.rect(0, 0, this.sprite.width, this.sprite.height);

    box.fill({ color: 'rgba(127,0,0, 0.1)' });

    this.addChild(box);
  }

  drawDebugHitbox() {
    if (!this.sprite) console.warn('Sprite is undefined!');
    const obj = new Graphics();

    obj.rect(
      this.hitbox.x,
      this.hitbox.y,
      this.hitbox.width,
      this.hitbox.height,
    );

    obj.stroke({
      color: 'blue',
      width: 2,
    });

    this.addChild(obj);
  }
}
