import { Assets, Container, Texture, TilingSprite } from 'pixi.js';
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
  scale?: number;
}

export class World extends Container {
  player!: Player;
  physics = new Physics();
  collisionManager = new CollisionManager();
  // world settings
  dimension = {
    width: 0,
    height: 0,
  };
  debugHitbox = {
    x: 0,
    y: 0,
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
  block = new Block();

  gravity: number = 0.8;

  controller: Controller;

  constructor({ dimension, scale = 4 }: WorldOptions) {
    super();
    this.controller = new Controller();
    this.dimension = dimension;
    this.worldScale = scale;
    this.backgroundSprite = new TilingSprite();
  }
  async loadAssets() {
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
  }

  async load() {
    await this.loadAssets();
    await this.loadPlayer();
    this.loadBackground();
    this.loadMap();
  }

  async loadPlayer() {
    const playerSprites = await Assets.load('warrior');
    const textures = playerSprites.textures;

    this.player = new Player({
      textures: {
        ATTACK: {
          source: textures['Attack1.png'],
          frameCount: 4,
        },
        HIT: {
          source: textures['Take Hit - white silhouette.png'],
          frameCount: 4,
        },
        IDLE: {
          source: textures['Idle.png'],
          frameCount: 8,
        },
        JUMP: {
          source: textures['Jump.png'],
          frameCount: 2,
        },
        RUN: {
          source: textures['Run.png'],
          frameCount: 8,
        },
      },
    });
  }
  //draw world entities
  draw() {
    // add the background first rendering it as the first layer
    this.addChild(this.backgroundSprite);

    // draw the map
    this.drawMap();

    // draw player
    this.player.draw();
    this.player.drawDebugBox();
    this.player.drawDebugHitbox();
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
    // NOTE: ordering is important since wrong order causes weird behaviour and staggering effects
    // bind controller keys updates
    // this.player.velocity.y = 0;
    this.bindKeys();

    // apply player class update
    this.player.update();

    // check for horizontal collision
    this.checkForHorizontalCollisions();

    // stop player movement in every frame
    this.player.stopMovement();

    // apply downward pull of the player entity
    this.physics.applyGravity(this.player);

    // checking vertical collision after the downward pull
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

  loadBackground() {
    const backgroundTexture = Texture.from('src/assets/images/background.png');
    // load the background
    this.backgroundSprite = new TilingSprite({
      texture: backgroundTexture,
    });
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
      block.draw(this.blockSize, this.blockSize, 'blue');

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
    const hitbox = this.player.getGlobalHixboxPosition();
  }

  checkForVerticalCollisions() {
    const allBlocks = [...this.blocks.floors, ...this.blocks.platforms];
    const hitbox = this.player.getGlobalHixboxPosition();
    const collistionOffset = this.collisionManager.collisionOffset;

    for (const block of allBlocks) {
      const isCollided = this.collisionManager.checkAABBCollision(
        block,
        hitbox,
      );

      if (isCollided) {
        // check for vertical collision
        // player is falling from the top
        if (this.player.velocity.y > 0) {
          console.log('top collision');

          this.player.isGrounded = true;
          this.player.velocity.y = 0;
          const offset = this.player.height - hitbox.offset;
          this.player.y = block.y - offset - collistionOffset;
          break;
        }

        if (this.player.velocity.y < 0) {
          console.log('bottom collision');

          const hitboxDistance = hitbox.y - this.player.y;
          const offset = hitboxDistance - block.height;

          const newPosY = block.y - offset + collistionOffset;
          this.player.y = newPosY;

          this.player.velocity.y = 0;
          break;
        }
      }
    }
  }
  checkForHorizontalCollisions() {
    const allBlocks = [...this.blocks.floors, ...this.blocks.platforms];
    const collistionOffset = this.collisionManager.collisionOffset;
    const hitbox = this.player.getGlobalHixboxPosition();

    for (const block of allBlocks) {
      const isCollided = this.collisionManager.checkAABBCollision(
        hitbox,
        block,
      );
      if (isCollided) {
        // check if player moving to right
        if (this.player.velocity.x > 0) {
          console.log('right collision');
          const hitboxDistance = hitbox.x - this.player.x;

          const offset = hitboxDistance + hitbox.width;

          const newPosX = block.x - offset - collistionOffset;

          this.player.x = newPosX;
          this.player.velocity.x = 0;
          break;
        }
        if (this.player.velocity.x < 0) {
          console.log('left collision');
          const hitboxDistance = hitbox.x - this.player.x;

          const offset = hitboxDistance - block.width;

          const newPosX = block.x - offset + collistionOffset;

          this.player.x = newPosX;
          this.player.velocity.x = 0;
          break;
        }
      }
    }
  }
}
