import * as BABYLON from '@babylonjs/core';

export default class Torch {
  private readonly light: BABYLON.PointLight;

  constructor(scene: BABYLON.Scene) {
    this.light = new BABYLON.PointLight('light1', BABYLON.Vector3.Zero(), scene);
    this.light.diffuse = BABYLON.Color3.FromHexString('#ff9944');
  }

  public copyPositionFrom(position: BABYLON.Vector3): void {
    this.light.position = position;
  }

  get intensity(): number {
    return this.light.intensity;
  }

  set intensity(intensity: number) {
    this.light.intensity = intensity;
  }
}
