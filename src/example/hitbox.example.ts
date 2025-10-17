import {
  AnimatedSprite,
  Application,
  Assets,
  Container,
  Graphics,
  Point,
  Text,
  Texture,
} from 'pixi.js';
import { AnimationHelper } from '../core/animation';
import { Block } from '../core/block';
import { CollisionManager } from '../core/collision';
import { Controller } from '../core/controller';
import { Physics } from '../core/physics';
const animationHelper = new AnimationHelper();
const dimension = {
  height: 432,
  width: 576,
} as const;

class Hitbox extends Container {
  texture: Texture;
  velocity = new Point(0, 0);
  sprite!: AnimatedSprite;
  hitbox = {
    x: 0,
    y: 0,
    width: 30,
    height: 50,
    offset: 5,
  };
  hitboxSides = {
    right: 0,
    left: 0,
    bottom: 0,
    top: 0,
  };
  constructor({ texture }: { texture: Texture }) {
    super();
    this.texture = texture;
  }

  draw() {
    const frames = animationHelper.getAnimationFrames({
      source: this.texture,
      frameCount: 8,
    });

    this.sprite = new AnimatedSprite(frames, true);

    // update the hitbox

    this.hitbox.x = this.sprite.width * 0.5 - this.hitbox.width * 0.5; // this will center the hitbox
    this.hitbox.y =
      this.sprite.height - this.hitbox.height - this.hitbox.offset;

    this.sprite.animationSpeed = 0.1;
    this.sprite.play();

    this.addChild(this.sprite);
  }

  update() {
    // todo apply updates
  }

  drawDebugBox() {
    const box = new Graphics();

    box.rect(0, 0, this.width, this.height);

    box.fill({ color: 'rgba(127,0,0, 0.1)' });

    this.addChild(box);
  }

  drawDebugHitBox() {
    const box = new Graphics();

    box.rect(
      this.hitbox.x,
      this.hitbox.y,
      this.hitbox.width,
      this.hitbox.height,
    );

    box.fill({ color: 'rgba(255,0,0, 0.3)' });

    this.addChild(box);
  }
  calculateHitboxSides() {
    const { x, y, width, height } = this;
    const hit = this.hitbox;

    this.hitboxSides.left = hit.x - x;
    this.hitboxSides.right = x + width - (hit.x + hit.width);
    this.hitboxSides.top = hit.y - y;
    this.hitboxSides.bottom = y + height - (hit.y + hit.height);
  }

  getHitboxBounds() {
    return {
      left: this.x + this.hitboxSides.left,
      right: this.x + this.width - this.hitboxSides.right,
      top: this.y + this.hitboxSides.top,
      bottom: this.y + this.height - this.hitboxSides.bottom,
    };
  }

  getHitboxGlobal() {
    const globalPosition = this.toGlobal({
      x: this.hitbox.x,
      y: this.hitbox.y,
    });

    return { ...this.hitbox, x: globalPosition.x, y: globalPosition.y };
  }
}

export const hitboxExample = async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({
    background: '#1099bb',
    height: dimension.height,
    width: dimension.width,
  });

  // load assets
  await Assets.load('src/assets/images/background.png');
  const warriorTexture = await Assets.load('src/assets/images/warrior.png');

  await Assets.load({
    alias: 'warrior',
    src: 'src/assets/images/warrior.json',
    data: {
      texture: warriorTexture,
    },
  });

  const playerSprites = await Assets.load('warrior');
  const textures = playerSprites.textures;

  // Append the application canvas to the document body
  document.getElementById('pixi-container')!.appendChild(app.canvas);

  const hitbox = new Hitbox({ texture: textures['Idle.png'] });
  hitbox.x = 200;
  hitbox.y = 180;
  hitbox.draw();
  hitbox.calculateHitboxSides();
  hitbox.drawDebugBox();
  hitbox.drawDebugHitBox();

  const block = new Block();

  block.draw(208, 48);
  block.x = 200;
  block.y = 300;
  app.stage.addChild(hitbox);
  app.stage.addChild(block);

  // add direction

  const guide = new Container();

  const text = new Text({
    text: 'Press using W, A, S, D to move around!',
    x: 50,
    y: 50,
  });

  guide.addChild(text);

  app.stage.addChild(guide);

  const collisionManager = new CollisionManager();
  const controller = new Controller();
  // apply physics
  const physics = new Physics();

  // Listen for animate update
  app.ticker.add(() => {
    hitbox.velocity.x = 0;

    // todo add update
    // check for collision
    if (controller.keys['KeyA'].pressed) {
      hitbox.velocity.x = -1;
    }
    if (controller.keys['KeyD'].pressed) {
      hitbox.velocity.x = 1;
    }
    if (controller.keys['KeyW'].pressed) {
      hitbox.velocity.y = -1;
    }
    if (controller.keys['KeyS'].pressed) {
      hitbox.velocity.y = 1;
    }

    hitbox.x += hitbox.velocity.x;
    checkHorizontalCollision();

    physics.applyGravity(hitbox);
    checkVerticalCollision();
  });

  function checkVerticalCollision() {
    const collistionOffset = collisionManager.collisionOffset; // apply offset for collision avoiding position shifting or jumping axis
    const internalHitbox = hitbox.getHitboxGlobal();
    const isCollided = collisionManager.checkAABBCollision(
      block,
      internalHitbox,
    );

    if (isCollided) {
      if (hitbox.velocity.y > 0) {
        console.log('top collision');
        hitbox.velocity.y = 0;
        const offset = hitbox.height - internalHitbox.offset;
        hitbox.y = block.y - offset - collistionOffset;
      }
      // bottom
      if (hitbox.velocity.y < 0) {
        console.log('bottom collision');
        const hitboxDistance = internalHitbox.y - hitbox.y;
        const offset = hitboxDistance - block.height;

        const newPosY = block.y - offset + collistionOffset;
        hitbox.y = newPosY;

        hitbox.velocity.y = 0;
      }
    }
  }

  function checkHorizontalCollision() {
    const collistionOffset = collisionManager.collisionOffset; // apply offset for collision avoiding position shifting or jumping axis
    const internalHitbox = hitbox.getHitboxGlobal();
    const isCollided = collisionManager.checkAABBCollision(
      block,
      internalHitbox,
    );

    if (isCollided) {
      // left collision
      if (hitbox.velocity.x < 0) {
        console.log('left collision');
        const hitboxDistance = internalHitbox.x - hitbox.x;

        const offset = hitboxDistance - block.width;

        const newPosX = block.x - offset + collistionOffset;

        hitbox.x = newPosX;
        hitbox.velocity.x = 0;
      }

      // right collision

      if (hitbox.velocity.x > 0) {
        console.log('right collision');
        const hitboxDistance = internalHitbox.x - hitbox.x;

        const offset = hitboxDistance + internalHitbox.width;

        const newPosX = block.x - offset - collistionOffset;

        hitbox.x = newPosX;
        hitbox.velocity.x = 0;
      }
    }
  }
};
