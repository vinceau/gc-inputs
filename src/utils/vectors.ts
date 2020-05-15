export class Vec2D {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  dot(vector: Vec2D): number {
    return this.x * vector.x + this.y * vector.y;
  }
}
