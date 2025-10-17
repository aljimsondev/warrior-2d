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
  'IDLE_LEFT' = 'IDLE_LEFT',
  'JUMP' = 'JUMP',
  'JUMP_LEFT' = 'JUMP_LEFT',
  'ATTACK' = 'ATTACK',
  'HIT' = 'HIT',
  'RUN' = 'RUN',
  'RUN_LEFT' = 'RUN_LEFT',
  'FALL' = 'FALL',
  'FALL_LEFT' = 'FALL_LEFT',
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
