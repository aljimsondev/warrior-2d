import { Container, Texture, TilingSprite } from 'pixi.js';
import { floorCollision } from '../assets/data/collision.data';
import { transform2d } from '../helpers/transform2d';
import { Controller } from './controller';
import { Player } from './player';

interface WorldOptions {
  dimension: {
    height: number;
    width: number;
  };
  backgroundTexture: Texture;
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

  gravity: number = 0.8;

  controller: Controller;

  constructor({ dimension, backgroundTexture }: WorldOptions) {
    super();
    this.player = new Player();
    this.controller = new Controller();
    this.dimension = dimension;
    this.backgroundSprite = new TilingSprite({
      texture: backgroundTexture,
      height: dimension.height,
      width: dimension.width,
    });
  }

  draw() {
    // draw background sprite
    // this.backgroundSprite.setSize(this.dimension.width, this.dimension.height);
    this.drawMap();
    this.backgroundSprite.tileScale.x = 4;
    this.backgroundSprite.tileScale.y = 4;
    this.backgroundSprite.tileTransform.position.set(
      0,
      this.backgroundSprite.height,
    );
    this.addChild(this.backgroundSprite);

    // draw player
    this.player.draw(100, 100);
    this.player.setSize(100);

    this.addChild(this.player);
  }
  drawMap() {
    this.map = transform2d(floorCollision, 36);

    this.map.forEach((row) => {
      row.forEach((tile) => {
        if (tile === 202) console.log('draw collision block');
      });
    });
  }
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
