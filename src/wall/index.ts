import * as BABYLON from '@babylonjs/core';

export default class Wall {
  private readonly mesh: BABYLON.Mesh;

  constructor(
    private scene: BABYLON.Scene,
    private material: BABYLON.StandardMaterial,
  ) {
    const options = {
      sideOrientation: BABYLON.Mesh.DOUBLESIDE,
      pattern: BABYLON.Mesh.FLIP_TILE,
      alignVertical: BABYLON.Mesh.TOP,
      alignHorizontal: BABYLON.Mesh.LEFT,
      width: 8,
      height: 16,
      depth: 8,
      tileSize: 1,
      tileWidth: 3,
    };

    this.mesh = BABYLON.MeshBuilder.CreateTiledBox('', options, this.scene);
    this.mesh.material = this.material;
    this.mesh.checkCollisions = true;
  }

  get position(): BABYLON.Vector3 {
    return this.mesh.position;
  }

  set position(position: BABYLON.Vector3) {
    this.mesh.position = position;
  }
}
