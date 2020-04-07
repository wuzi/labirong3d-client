import * as BABYLON from '@babylonjs/core';
import Game from '../game';

export default class FollowCamera {
  private static readonly CAMERA_DISTANCE = 25;

  private readonly camera: BABYLON.FollowCamera;

  constructor(game: Game, mesh: BABYLON.Mesh) {
    this.camera = new BABYLON.FollowCamera('FollowCam', mesh.position.add(new BABYLON.Vector3(0.0, 5.0, -45.0)), game.scene);
    this.camera.radius = FollowCamera.CAMERA_DISTANCE;
    this.camera.heightOffset = 3;
    this.camera.rotationOffset = 90;
    this.camera.cameraAcceleration = 0;
    this.camera.maxCameraSpeed = 20;
    this.camera.attachControl(game.canvas, true);
    this.camera.lockedTarget = mesh;
  }

  public follow(mesh: BABYLON.Mesh): void {
    this.camera.position.x = mesh.position.x + FollowCamera.CAMERA_DISTANCE;
    this.camera.position.y = mesh.position.y + FollowCamera.CAMERA_DISTANCE;
    this.camera.position.z = mesh.position.z - FollowCamera.CAMERA_DISTANCE;
  }
}
