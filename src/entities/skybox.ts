import * as BABYLON from '@babylonjs/core';

export default class Skybox {
  private readonly mesh: BABYLON.Mesh;

  private readonly material: BABYLON.StandardMaterial;

  constructor(scene: BABYLON.Scene) {
    this.mesh = BABYLON.MeshBuilder.CreateBox('skyBox', { size: 1000.0 }, scene);
    this.material = new BABYLON.StandardMaterial('skyBox', scene);

    this.material.backFaceCulling = false;
    this.material.diffuseColor = new BABYLON.Color3(0, 0, 0);
    this.material.specularColor = new BABYLON.Color3(0, 0, 0);

    this.material.reflectionTexture = new BABYLON.CubeTexture('assets/textures/skybox', scene);
    this.material.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;

    this.mesh.material = this.material;
  }
}
