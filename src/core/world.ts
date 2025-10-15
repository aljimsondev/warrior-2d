import { Container, Texture, TilingSprite } from 'pixi.js';
import {
  floorCollision,
  platformCollisions,
} from '../assets/data/collision.data';
import { transform2d } from '../helpers/transform2d';
import { Block } from './block';
import { CollisionManager } from './collision';
import { Controller } from './controller';
import { Physics } from './physics';
import { Player } from './player';

interface WorldOptions {
  dimension: {
    height: number;
    width: number;
  };
  backgroundTexture: Texture;
  scale?: number;
}

export class World extends Container {
  player: Player;
  physics = new Physics();
  collisionManager = new CollisionManager();
  // world settings
  dimension = {
    width: 0,
    height: 0,
  };
  backgroundSprite: TilingSprite;
  blocks: {
    floors: Block[];
    platforms: Block[];
  } = { floors: [], platforms: [] };
  blockSize = 16;
  worldScale = 4;

  gravity: number = 0.8;

  controller: Controller;

  constructor({ dimension, backgroundTexture, scale = 4 }: WorldOptions) {
    super();
    this.player = new Player();
    this.controller = new Controller();
    this.dimension = dimension;
    this.backgroundSprite = new TilingSprite({
      texture: backgroundTexture,
    });

    this.worldScale = scale;
  }
  load() {
    this.loadMap();
  }

  //draw world entities
  draw() {
    // add the background first rendering it as the first layer
    this.addChild(this.backgroundSprite);

    // draw the map
    this.drawMap();

    // draw player
    this.player.draw(this.blockSize, this.blockSize);
    this.player.position.set(
      3 * this.blockSize,
      this.dimension.height -
        6 * this.blockSize -
        this.collisionManager.collisionOffset, // place player position in the platform
    );

    this.addChild(this.player);
  }

  // apply updates to world entities
  update() {
    this.player.update();

    // stop player movement in every frame
    this.player.stopMovement();

    // bind controller keys updates
    this.bindKeys();
    this.checkForHorizontalCollisions();
    this.physics.applyGravity(this.player);
    this.checkForVerticalCollisions();

    // world bound listener
    this.enforceWorldBounds();
  }
  // load the tile maps
  loadMap() {
    // load floor map
    const floorMapBlocks: Block[] = [];
    const platformMapBlocks: Block[] = [];

    const floorMap2d = transform2d(floorCollision, 36);
    const platformMap2d = transform2d(platformCollisions, 36);

    floorMap2d.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (tile === 202) {
          const block = new Block();
          block.x = x * this.blockSize;
          block.y = y * this.blockSize;
          // push block to the array
          floorMapBlocks.push(block);
        }
      });
    });

    // loop the map
    platformMap2d.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (tile > 0) {
          const block = new Block();
          block.x = x * this.blockSize;
          block.y = y * this.blockSize;
          // push block to the array
          platformMapBlocks.push(block);
        }
      });
    });

    this.blocks.floors = floorMapBlocks;
    this.blocks.platforms = platformMapBlocks;
  }

  // render the tile maps
  drawMap() {
    this.drawFloor();
    this.drawPlatforms();
  }

  drawPlatforms() {
    this.blocks.platforms.map((block) => {
      block.draw(this.blockSize, this.blockSize);

      this.addChild(block);
    });
  }

  drawFloor() {
    this.blocks.floors.forEach((block) => {
      block.draw(this.blockSize, this.blockSize);

      this.addChild(block);
    });
  }

  bindKeys() {
    if (
      this.controller.keys['KeyA'].pressed &&
      this.controller.keys['KeyD'].pressed
    ) {
      this.player.stopMovement();
    } else if (this.controller.keys['KeyA'].pressed) {
      this.player.moveLeft();
    } else if (this.controller.keys['KeyD'].pressed) {
      this.player.moveRight();
    }

    if (this.controller.keys['Space'].pressed) {
      this.player.jump();
    }
  }

  /**
   * Manage world bounts e.g. when player drops to the edge of the screen
   */
  enforceWorldBounds() {
    // check player reaches the bottom
    if (
      this.player.y + this.player.height + this.player.velocity.y >=
      this.dimension.height
    ) {
      this.player.velocity.y = 0;
      this.player.y = this.dimension.height - this.player.height;
      this.player.isGrounded = true;
    }

    // check player move too far to the right
    if (this.player.x <= 0) {
      this.player.x = 0;
    }
    // check player move too far to the right
    if (this.player.x + this.player.width >= this.dimension.width) {
      this.player.x = this.dimension.width - this.player.width;
    }
    // check if player goes of the top screen
    if (this.player.y <= 0) {
      this.player.y = 0;
    }
  }

  checkForVerticalCollisions() {
    const allBlocks = [...this.blocks.floors, ...this.blocks.platforms];

    for (const block of allBlocks) {
      const isCollided = this.collisionManager.checkAABBCollision(
        this.player,
        block,
      );

      if (isCollided) {
        // check for vertical collision
        // player is falling from the top
        if (this.player.velocity.y > 0) {
          console.log('top collision');

          this.player.isGrounded = true;

          this.player.velocity.y = 0;
          this.player.y =
            block.y -
            this.player.height -
            this.collisionManager.collisionOffset;
          break;
        }

        if (this.player.velocity.y < 0) {
          this.player.velocity.y = 0;
          this.player.y =
            block.y + block.height + this.collisionManager.collisionOffset;
          break;
        }
      }
    }
  }
  checkForHorizontalCollisions() {
    const allBlocks = [...this.blocks.floors, ...this.blocks.platforms];

    for (const block of allBlocks) {
      const isCollided = this.collisionManager.checkAABBCollision(
        this.player,
        block,
      );

      if (isCollided) {
        // check if player moving to right
        if (this.player.velocity.x > 0) {
          console.log('right collision');
          this.player.velocity.x = 0;
          this.player.x =
            block.x - this.player.width - this.collisionManager.collisionOffset;
          break;
        }

        if (this.player.velocity.x < 0) {
          console.log('left collision');
          this.player.velocity.x = 0;
          this.player.x =
            block.x + block.width + this.collisionManager.collisionOffset;
          break;
        }
      }
    }
  }
}
