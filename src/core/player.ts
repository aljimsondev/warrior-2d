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
  facing: 'right' | 'left' = 'right';

  // graphics
  textures: EntityTexture;
  animationState: PlayerAnimationState = 'IDLE';
  sprite!: AnimatedSprite;

  // hitbox
  hitbox = {
    x: 0,
    y: 0,
    width: 30,
    height: 50,
    offset: 5,
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

    if (this.velocity.x === 0 && this.velocity.y === 0) {
      if (this.facing === 'left') {
        this.setAnimationState('IDLE_LEFT');
      } else {
        this.setAnimationState('IDLE');
      }
    }

    // check if player is falling
    if (this.velocity.y > 0.5) {
      if (this.facing === 'left') {
        this.setAnimationState('FALL_LEFT');
      } else {
        this.setAnimationState('FALL');
      }
    }
  }
  //player movements
  moveLeft() {
    this.velocity.x = -this.speed;
    if (this.isGrounded) this.setAnimationState('RUN_LEFT');
    this.facing = 'left';
  }
  moveRight() {
    this.velocity.x = this.speed;
    if (this.isGrounded) this.setAnimationState('RUN');
    this.facing = 'right';
  }
  stopMovement() {
    this.velocity.x = 0;
  }
  jump() {
    if (this.isGrounded) {
      this.velocity.y = -this.jumpPower;
      this.isGrounded = false;
      if (this.facing === 'left') {
        this.setAnimationState('JUMP_LEFT');
      } else {
        this.setAnimationState('JUMP');
      }
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
