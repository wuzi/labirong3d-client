import {
  Scene, Vector3, Axis, AbstractMesh, Skeleton,
} from '@babylonjs/core';
import PlayerMesh from './mesh';

export default class Player {
  public readonly mesh: PlayerMesh;

  private readonly velocity = 0.5;

  private speed: Vector3;

  constructor(scene: Scene, meshes: AbstractMesh[], skeletons: Skeleton[]) {
    this.mesh = new PlayerMesh(scene, meshes[0], skeletons[0]);
    this.speed = new Vector3(0, 0, 0);
  }

  public setSpeedByInput(input: Input): void {
    this.speed.x = 0.0;
    this.speed.z = 0.00001;

    if (input.w || input.ArrowUp) {
      this.speed.x = -this.velocity;
      this.speed.z = this.velocity;
    }

    if (input.a || input.ArrowLeft) {
      this.speed.x = -this.velocity;
      this.speed.z = -this.velocity;
    }

    if (input.s || input.ArrowDown) {
      this.speed.x = this.velocity;
      this.speed.z = -this.velocity;
    }

    if (input.d || input.ArrowRight) {
      this.speed.x = this.velocity;
      this.speed.z = this.velocity;
    }
  }

  public move(): void {
    if (!this.mesh.body) return;
    this.mesh.body.moveWithCollisions(this.speed);
  }

  public updateDirection(): void {
    if (this.speed.length() <= 0.01 || !this.mesh.body) {
      return;
    }

    const tempSpeed = new Vector3(0, 0, 0);
    tempSpeed.copyFrom(this.speed);

    const dot = Vector3.Dot(tempSpeed.normalize(), Axis.Z);
    let al = Math.acos(dot);
    let t = 0;

    if (tempSpeed.x < 0.0) {
      al = Math.PI * 2.0 - al;
    }

    if (al > this.mesh.body.rotation.y) {
      t = Math.PI / 30;
    } else {
      t = -Math.PI / 30;
    }

    const ad = Math.abs(this.mesh.body.rotation.y - al);

    if (ad > Math.PI) {
      t = -t;
    }

    if (ad < Math.PI / 15) {
      t = 0;
    }

    this.mesh.body.rotation.y += t;

    if (this.mesh.body.rotation.y > Math.PI * 2) {
      this.mesh.body.rotation.y -= Math.PI * 2;
    }

    if (this.mesh.body.rotation.y < 0) {
      this.mesh.body.rotation.y += Math.PI * 2;
    }
  }
}
