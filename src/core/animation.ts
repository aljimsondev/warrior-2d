import { Rectangle, Texture } from 'pixi.js';

export class AnimationHelper {
  getAnimationFrames({
    source,
    frameCount,
  }: {
    source: Texture;
    frameCount: number;
  }) {
    const frames = this.getFrames(source, frameCount);

    return frames;
  }

  getFrames(texture: Texture, frameCount: number) {
    const frames: Texture[] = [];

    for (let i = 0; i < frameCount; i++) {
      const frame = this.getFrameTextureByIndex({
        frameCount: frameCount,
        frameIndex: i,
        texture: texture,
      });
      frames[i] = frame;
    }

    return frames;
  }

  getFrameTextureByIndex({
    frameCount,
    frameIndex,
    texture,
  }: {
    texture: Texture;
    frameIndex: number;
    frameCount: number;
  }): Texture {
    const frameWidth = texture.width / frameCount;

    const frame = new Rectangle(
      texture.frame.x + frameIndex * frameWidth,
      texture.frame.y,
      frameWidth,
      texture.height,
    );

    // Create a new texture from the base texture using the frame rectangle
    return new Texture({
      source: texture as any,
      frame: frame,
    });
  }
}
