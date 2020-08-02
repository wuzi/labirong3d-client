import * as BABYLON from '@babylonjs/core';

export default class Ground {
  private readonly mesh: BABYLON.Mesh;

  private readonly material: BABYLON.StandardMaterial;

  constructor(scene: BABYLON.Scene) {
    this.mesh = BABYLON.MeshBuilder.CreateTiledGround('gd', {
      xmin: -64,
      xmax: 64,
      zmin: -64,
      zmax: 64,
      subdivisions: {
        w: 8,
        h: 8,
      },
    });

    this.material = new BABYLON.StandardMaterial('groundMaterial', scene);
    this.material.diffuseTexture = new BABYLON.Texture('assets/textures/floor.png', scene);
    this.mesh.material = this.material;
  }
}
