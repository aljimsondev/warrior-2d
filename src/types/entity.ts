import { Texture } from 'pixi.js';

export interface Entity {
  x: number;
  y: number;
  height: number;
  width: number;
}

export interface EntityWithVelocity extends Entity {
  velocity: {
    x: number;
    y: number;
  };
}

enum PlayerStates {
  'IDLE' = 'IDLE',
  'JUMP' = 'JUMP',
  'ATTACK' = 'ATTACK',
  'HIT' = 'HIT',
  'RUN' = 'RUN',
}

export type EntityTexture = {
  [K in PlayerStates]: {
    source: Texture;
    frameCount: number; // how many frame this texture has
  };
};

export type PlayerAnimationState = keyof typeof PlayerStates;

export interface PlayerOptions {
  textures: EntityTexture;
}
