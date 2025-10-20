import { Application, Container } from 'pixi.js';
import { Block } from '../core/block';
import { Camera } from '../core/camera';
import { Controller } from '../core/controller';

const dimension = {
  height: 576,
  width: 1080,
} as const;

export const cameraExample = async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({
    background: '#1099bb',
    height: dimension.height,
    width: dimension.width,
  });
  // Append the application canvas to the document body
  document.getElementById('pixi-container')!.appendChild(app.canvas);

  const world = new World({
    worldHeight: 3074,
    worldWidth: 3074,
  });

  world.draw();

  app.stage.addChild(world);

  // Listen for animate update
  app.ticker.add(() => {
    world.update();
  });
};

function createMap() {
  const blocks: number[][] = [];

  for (let i = 0; i < 64; i++) {
    blocks[i] = [];
    for (let j = 0; j < 64; j++) {
      blocks[i][j] = 0;
    }
  }

  return blocks;
}

export class World extends Container {
  map: number[][];
  worldContainer: Container;
  blockSize = 48;
  camera!: Camera;
  targetBlock: Block = new Block();
  controller = new Controller();
  speed = 3;
  constructor({
    worldHeight,
    worldWidth,
  }: {
    worldHeight: number;
    worldWidth: number;
  }) {
    super();
    this.map = createMap();
    this.worldContainer = new Container();
    this.camera = new Camera({
      viewportHeight: dimension.height,
      viewportWidth: dimension.width,
      worldHeight: worldHeight,
      worldWidth: worldWidth,
    });
  }

  draw() {
    this.addChild(this.worldContainer);
    this.drawTiles();
    this.worldContainer.addChild(this.targetBlock);

    // draw the target block
    this.targetBlock.x = 300;
    this.targetBlock.y = 200;
    this.worldContainer.addChild(this.targetBlock);

    this.targetBlock.draw(this.blockSize, this.blockSize, 'red');

    this.camera.snapTo({
      height: this.targetBlock.height,
      width: this.targetBlock.width,
      x: this.targetBlock.x,
      y: this.targetBlock.y,
    });

    this.worldContainer.addChild(this.camera.createDebug());
  }
  /**
   * Sets the camera instance
   *
   * NOTE: Make sure that the world is rendered before calling this method to get the world size value
   */
  setCamera() {}

  drawTiles() {
    this.map.forEach((row, y) => {
      row.forEach((tile, x) => {
        const block = new Block();
        block.draw(this.blockSize, this.blockSize);
        block.x = x * this.blockSize;
        block.y = y * this.blockSize;
        // push block to the array

        this.worldContainer.addChild(block);
      });
    });
  }

  update() {
    if (this.controller.keys['KeyA'].pressed) {
      this.targetBlock.velocity.x += -this.speed;
    }
    if (this.controller.keys['KeyD'].pressed) {
      this.targetBlock.velocity.x += this.speed;
    }

    if (this.controller.keys['KeyW'].pressed) {
      this.targetBlock.velocity.y += -this.speed;
    }
    if (this.controller.keys['KeyS'].pressed) {
      this.targetBlock.velocity.y += this.speed;
    }

    this.targetBlock.x = 0;
    this.targetBlock.y = 0;

    this.targetBlock.x += this.targetBlock.velocity.x;
    this.targetBlock.y += this.targetBlock.velocity.y;
    this.camera.follow(this.targetBlock);
    // Apply camera transform to world
    this.camera.applyTransform(this.worldContainer);
  }
}
