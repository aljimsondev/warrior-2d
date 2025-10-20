import { Container, Graphics } from 'pixi.js';

interface CameraOptions {
  viewportWidth: number;
  viewportHeight: number;
  worldWidth: number;
  worldHeight: number;
  smoothing?: number;
  deadzoneWidth?: number;
  deadzoneHeight?: number;
  lookAheadDistance?: number;
}

export class Camera {
  // Current camera position
  x: number = 0;
  y: number = 0;

  // Target position (where camera wants to be)
  private targetX: number = 0;
  private targetY: number = 0;

  // Configuration
  private viewportWidth: number;
  private viewportHeight: number;
  private worldWidth: number;
  private worldHeight: number;
  private smoothing: number;
  private deadzoneWidth: number;
  private deadzoneHeight: number;
  private lookAheadDistance: number;

  // Look ahead
  private currentLookAhead: number = 0;

  constructor(options: CameraOptions) {
    this.viewportWidth = options.viewportWidth;
    this.viewportHeight = options.viewportHeight;
    this.worldWidth = options.worldWidth;
    this.worldHeight = options.worldHeight;
    this.smoothing = options.smoothing ?? 0.1;
    this.deadzoneWidth = options.deadzoneWidth ?? this.viewportWidth * 0.3;
    this.deadzoneHeight = options.deadzoneHeight ?? this.viewportHeight * 0.4;
    this.lookAheadDistance = options.lookAheadDistance ?? 80;
  }

  /**
   * Update camera to follow target entity
   */
  follow(
    target: { x: number; y: number; width: number; height: number },
    direction: 'left' | 'right' | 'none' = 'none',
  ) {
    // Calculate target center point
    const targetCenterX = target.x + target.width / 2;
    const targetCenterY = target.y + target.height / 2;

    // Apply look-ahead based on direction
    let lookAheadOffset = 0;
    if (direction === 'right') {
      this.currentLookAhead = this.lerp(
        this.currentLookAhead,
        this.lookAheadDistance,
        0.05,
      );
      lookAheadOffset = this.currentLookAhead;
    } else if (direction === 'left') {
      this.currentLookAhead = this.lerp(
        this.currentLookAhead,
        -this.lookAheadDistance,
        0.05,
      );
      lookAheadOffset = this.currentLookAhead;
    } else {
      // Gradually return to center when not moving
      this.currentLookAhead = this.lerp(this.currentLookAhead, 0, 0.02);
      lookAheadOffset = this.currentLookAhead;
    }

    // Calculate camera position (inverse of target to center it)
    const camX = targetCenterX - this.viewportWidth / 2 + lookAheadOffset;
    const camY = targetCenterY - this.viewportHeight / 2;

    // Horizontal deadzone logic
    const deadzoneLeft =
      this.targetX + (this.viewportWidth - this.deadzoneWidth) / 2;
    const deadzoneRight = deadzoneLeft + this.deadzoneWidth;

    if (targetCenterX < deadzoneLeft) {
      this.targetX = camX;
    } else if (targetCenterX > deadzoneRight) {
      this.targetX = camX;
    }

    // Vertical deadzone logic (more lenient for platformers)
    const deadzoneTop =
      this.targetY + (this.viewportHeight - this.deadzoneHeight) / 2;
    const deadzoneBottom = deadzoneTop + this.deadzoneHeight;

    if (targetCenterY < deadzoneTop) {
      this.targetY = camY;
    } else if (targetCenterY > deadzoneBottom) {
      this.targetY = camY;
    }

    // Clamp camera to world bounds
    this.targetX = this.clamp(
      this.targetX,
      0,
      this.worldWidth - this.viewportWidth,
    );
    this.targetY = this.clamp(
      this.targetY,
      0,
      this.worldHeight - this.viewportHeight,
    );

    // Smooth camera movement using lerp
    this.x = this.lerp(this.x, this.targetX, this.smoothing);
    this.y = this.lerp(this.y, this.targetY, this.smoothing);
  }

  /**
   * Apply camera transform to world container
   */
  applyTransform(worldContainer: Container) {
    worldContainer.x = -this.x;
    worldContainer.y = -this.y;
  }

  /**
   * Instantly snap camera to target (useful for initialization)
   */
  snapTo(target: { x: number; y: number; width: number; height: number }) {
    const targetCenterX = target.x + target.width / 2;
    const targetCenterY = target.y + target.height / 2;

    this.targetX = targetCenterX - this.viewportWidth / 2;
    this.targetY = targetCenterY - this.viewportHeight / 2;

    // Clamp to bounds
    this.targetX = this.clamp(
      this.targetX,
      0,
      this.worldWidth - this.viewportWidth,
    );
    this.targetY = this.clamp(
      this.targetY,
      0,
      this.worldHeight - this.viewportHeight,
    );

    // Snap instantly
    this.x = this.targetX;
    this.y = this.targetY;
  }

  /**
   * Update viewport size (useful for window resize)
   */
  updateViewport(width: number, height: number) {
    this.viewportWidth = width;
    this.viewportHeight = height;
    this.deadzoneWidth = width * 0.3;
    this.deadzoneHeight = height * 0.4;
  }

  /**
   * Linear interpolation helper
   */
  private lerp(start: number, end: number, t: number): number {
    return start + (end - start) * t;
  }

  /**
   * Clamp helper
   */
  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Get camera bounds for culling
   */
  getBounds() {
    return {
      left: this.x,
      right: this.x + this.viewportWidth,
      top: this.y,
      bottom: this.y + this.viewportHeight,
    };
  }
  createDebug() {
    const debugBox = new Graphics();

    debugBox.rect(this.x, this.y, this.viewportWidth, this.viewportHeight);
    debugBox.stroke({
      color: 'red',
      width: 2,
    });

    return debugBox;
  }
}
