import { Application } from 'pixi.js';
import { World } from './core/world';
import { hitboxExample } from './example/hitbox.example';

const dimension = {
  height: 432,
  width: 576,
} as const;

(async () => {
  return hitboxExample();
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
    dimension: dimension,
  });
  // load the world assets, settings, environment etc.
  await world.load();

  //render the world
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
