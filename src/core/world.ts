import { Container } from 'pixi.js';
import { Controller } from './controller';
import { Player } from './player';

interface WorldOptions {
  dimension: {
    height: number;
    width: number;
  };
}

export class World extends Container {
  player: Player;
  // world settings
  dimension = {
    width: 0,
    height: 0,
  };
  gravity: number = 0.8;

  controller: Controller;

  constructor({ dimension }: WorldOptions) {
    super();
    this.player = new Player();
    this.controller = new Controller();
    this.dimension = dimension;
  }
  draw() {
    // draw player
    this.player.draw(100, 100);
    this.player.setSize(100);

    this.addChild(this.player);
  }

  update() {
    // stop player movement every frame

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
