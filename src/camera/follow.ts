import * as BABYLON from '@babylonjs/core';
import Game from '../game';

export default class FollowCamera {
  private static readonly CAMERA_DISTANCE = 10;

  private readonly camera: BABYLON.FollowCamera;

  constructor(
    private readonly game: Game,
    private readonly mesh: BABYLON.Mesh,
  ) {
    this.camera = new BABYLON.FollowCamera('FollowCam', this.mesh.position.add(new BABYLON.Vector3(0.0, 5.0, -45.0)), this.game.scene);
    this.camera.radius = FollowCamera.CAMERA_DISTANCE;
    this.camera.attachControl(this.game.canvas, true);
  }

  public lockTarget(target: BABYLON.Nullable<BABYLON.AbstractMesh>): void {
    this.camera.lockedTarget = target;
  }
}
