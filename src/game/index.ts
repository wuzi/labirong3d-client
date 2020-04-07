import * as BABYLON from '@babylonjs/core';

export default class Game {
  public readonly canvas: HTMLCanvasElement;

  public readonly engine: BABYLON.Engine;

  public readonly scene: BABYLON.Scene;

  constructor() {
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.engine = new BABYLON.Engine(this.canvas, true);
    this.scene = new BABYLON.Scene(this.engine);
  }
}
