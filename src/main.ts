import { Application } from 'pixi.js';
import { World } from './core/world';

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: '#1099bb', resizeTo: window });

  // Append the application canvas to the document body
  document.getElementById('pixi-container')!.appendChild(app.canvas);

  const world = new World({
    dimension: {
      height: app.screen.height,
      width: app.screen.width,
    },
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
