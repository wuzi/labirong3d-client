import {
  Color3, PointLight, Scene, Vector3,
} from '@babylonjs/core';

export default class Torch {
  private readonly light: PointLight;

  constructor(scene: Scene) {
    this.light = new PointLight('light1', Vector3.Zero(), scene);
    this.light.intensity = 1;
    this.light.diffuse = Color3.FromHexString('#ff9944');
  }

  public copyPositionFrom(position: Vector3): void {
    this.light.position = position;
  }
}
