import { HemisphericLight, Scene, Vector3 } from '@babylonjs/core';

export default class Sunlight {
  private readonly light: HemisphericLight;

  get intensity(): number {
    return this.light.intensity;
  }

  set intensity(intensity: number) {
    this.light.intensity = intensity;
  }

  constructor(scene: Scene) {
    this.light = new HemisphericLight('sky', new Vector3(0, 1.0, 0), scene);
  }
}
