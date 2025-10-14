export class Controller {
  keys = {
    KeyA: {
      pressed: false,
    },
    KeyD: {
      pressed: false,
    },
    Space: {
      pressed: false,
    },
  };
  constructor() {
    window.addEventListener('keydown', (e) => this.handleKeyDown(e));
    window.addEventListener('keyup', (e) => this.handleKeyUp(e));
  }

  handleKeyDown(e: KeyboardEvent) {
    const key = this.keys[e.code as keyof typeof this.keys];

    if (!key) return;

    this.keys[e.code as keyof typeof this.keys].pressed = true;
  }

  handleKeyUp(e: KeyboardEvent) {
    const key = this.keys[e.code as keyof typeof this.keys];

    if (!key) return;

    this.keys[e.code as keyof typeof this.keys].pressed = false;
  }
}
