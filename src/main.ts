import { Application, Assets, Texture } from 'pixi.js';
import { World } from './core/world';

const dimension = {
  height: 576,
  width: 1024,
} as const;

(async () => {
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

  // load assets
  await Assets.load('src/assets/images/background.png');

  const world = new World({
    dimension: {
      height: 576,
      width: 1024,
    },
    backgroundTexture: Texture.from('src/assets/images/background.png'),
  });

  world.draw();

  app.stage.addChild(world);
  // Listen for animate update
  app.ticker.add((time) => {
    // Just for fun, let's rotate mr rabbit a little.
    // * Delta is 1 if running at 100% performance *
    // * Creates frame-independent transformation *
    world.update();
  });
})();
