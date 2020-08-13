import * as BABYLON from '@babylonjs/core';

export default class Sunlight {
  private readonly light: BABYLON.HemisphericLight;

  constructor(scene: BABYLON.Scene) {
    this.light = new BABYLON.HemisphericLight('sky', new BABYLON.Vector3(0, 1.0, 0), scene);
  }

  get intensity(): number {
    return this.light.intensity;
  }

  set intensity(intensity: number) {
    this.light.intensity = intensity;
  }
}
