import * as BABYLON from '@babylonjs/core';

export default class Wall {
  private readonly mesh: BABYLON.InstancedMesh;

  constructor(box: BABYLON.Mesh) {
    this.mesh = box.createInstance('wall');
    this.mesh.checkCollisions = true;
  }

  get position(): BABYLON.Vector3 {
    return this.mesh.position;
  }

  set position(position: BABYLON.Vector3) {
    this.mesh.position = position;
  }
}
