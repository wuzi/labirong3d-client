import {
  Scene, Vector3, AbstractMesh, Skeleton,
} from '@babylonjs/core';
import PlayerMesh from './mesh';

export default class Player {
  public readonly mesh: PlayerMesh;

  private readonly velocity = 0.07;

  private speed: Vector3;

  private readonly gravity: Vector3;

  private direction: Vector3;

  constructor(private scene: Scene, meshes: AbstractMesh[], skeletons: Skeleton[]) {
    this.mesh = new PlayerMesh(scene, meshes[0], skeletons[0]);
    this.mesh.body.position.x = 12;
    this.mesh.body.position.y = 10;

    this.scene = scene;
    this.speed = new Vector3(0, 0, 0);
    this.gravity = new Vector3(0, -0.1, 0);
    this.direction = new Vector3();
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

  public setGravity(): void {
    this.mesh.body.moveWithCollisions(this.gravity);
  }

  public move(): void {
    this.mesh.body.moveWithCollisions(this.speed);
  }

  public updateDirection(): void {
    window.addEventListener('mousemove', () => {
      const pickResult = this.scene.pick(this.scene.pointerX, this.scene.pointerY);

      if (pickResult && pickResult.hit) {
        const direction = pickResult.pickedPoint;
        if (direction) {
          this.direction.x = direction.x - this.mesh.body.position.x;
          this.direction.y = direction.z - this.mesh.body.position.z;

          const angle = Math.atan2(-this.direction.x, -this.direction.y);
          this.mesh.body.rotation.y = angle;
        }
      }
    });
  }
}
