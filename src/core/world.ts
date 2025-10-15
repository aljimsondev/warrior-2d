import { Container, Texture, TilingSprite } from 'pixi.js';
import { floorCollision } from '../assets/data/collision.data';
import { transform2d } from '../helpers/transform2d';
import { Block } from './block';
import { Controller } from './controller';
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
  // world settings
  dimension = {
    width: 0,
    height: 0,
  };
  backgroundSprite: TilingSprite;
  map: number[][] = [];
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

  draw() {
    const viewportHeight = this.dimension.height / this.worldScale;
    // draw background sprite
    // this.backgroundSprite.tileScale.x = 4;
    // this.backgroundSprite.tileScale.y = 4;
    // this.backgroundSprite.tileTransform.position.set(
    //   0,
    //   -(this.backgroundSprite.texture.height - viewportHeight),
    // );
    this.addChild(this.backgroundSprite);
    console.log(this.backgroundSprite);
    this.drawMap();
    // draw player
    this.player.draw(100, 100);
    this.player.setSize(this.blockSize);

    this.addChild(this.player);
    // this.scale.set(this.worldScale);
  }
  drawMap() {
    this.map = transform2d(floorCollision, 36);

    this.map.forEach((row, y) => {
      row.forEach((tile, x) => {
        if (tile === 202) {
          const block = new Block();
          block.x = x * this.blockSize;
          block.y = y * this.blockSize;
          // Scale the block

          block.draw(this.blockSize, this.blockSize);
          // block.scale.set(this.worldScale);
          console.log({ x: block.x, y: block.y });
          this.addChild(block);
        }
      });
    });
  }
  // For parallax scrolling based on player movement:
  // updateCamera() {
  //   // Scroll background at half speed of player for parallax effect
  //   const parallaxSpeed = 0.5;
  //   this.backgroundSprite.tileTransform.position.x =
  //     -this.player.x * parallaxSpeed;
  // }
  update() {
    this.applyGravity();
    this.player.update();

    // stop player movement in every frame
    this.player.stopMovement();

    // bind controller keys updates
    this.bindKeys();

    // check player reaches the bottom
    if (
      this.player.y + this.player.height + this.player.velocity.y >=
      this.dimension.height
    ) {
      this.player.velocity.y = 0;
      this.player.y = this.dimension.height - this.player.height;
    } else this.applyGravity();
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
  // physics related  functions
  applyGravity() {
    this.player.velocity.y += this.gravity;
  }
}
