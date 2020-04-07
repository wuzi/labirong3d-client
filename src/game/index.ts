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

  public async loadMap(): Promise<void> {
    const { meshes } = await BABYLON.SceneLoader.ImportMeshAsync('', 'assets/', 'village.obj', this.scene);
    meshes.map((m) => {
      const mesh = m;

      if (mesh.name.search('terrain_grass') === -1) {
        mesh.isPickable = false;
      }

      mesh.checkCollisions = true;
      return mesh;
    });
  }
}
