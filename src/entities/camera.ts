import * as BABYLON from '@babylonjs/core';

export default class Camera {
  private static readonly CAMERA_DISTANCE = 10;

  private readonly camera: BABYLON.ArcRotateCamera;

  constructor(scene: BABYLON.Scene, canvas: HTMLElement) {
    this.camera = new BABYLON.ArcRotateCamera('PlayerCam', 0, 0.8, Camera.CAMERA_DISTANCE, new BABYLON.Vector3(0, 0, 0), scene);

    this.camera.checkCollisions = true;
    this.camera.collisionRadius = new BABYLON.Vector3(1, 0.5, 1);

    this.camera.upperBetaLimit = Math.PI / 2;
    this.camera.lowerRadiusLimit = 5;
    this.camera.upperRadiusLimit = Camera.CAMERA_DISTANCE;

    this.camera.attachControl(canvas, true);
  }

  public lockTarget(target: BABYLON.AbstractMesh): void {
    this.camera.lockedTarget = target;
    this.camera.targetScreenOffset = new BABYLON.Vector2(0, -2);
  }
}
