import {
  AbstractMesh,
  ActionManager,
  ExecuteCodeAction,
  Skeleton,
  Vector3,
} from '@babylonjs/core';

import Game from '../game';
import Network from '../network';
import PlayerMesh from './mesh';

export default class Player {
  public readonly mesh: PlayerMesh;

  private readonly velocity = 0.1;

  private readonly speed: Vector3;

  private readonly gravity: Vector3;

  private direction: Vector3;

  private keyPressed: Input;

  constructor(
    private game: Game,
    meshes: AbstractMesh[],
    skeletons: Skeleton[],
    public readonly id: number | undefined = undefined,
  ) {
    this.mesh = new PlayerMesh(game.scene, meshes[0], skeletons[0]);
    this.mesh.body.position.x = 12;
    this.mesh.body.position.y = 10;

    this.speed = new Vector3(0, 0, 0);
    this.gravity = new Vector3(0, -0.1, 0);
    this.direction = new Vector3();

    this.keyPressed = {};
  }

  get position(): Vector3 {
    return this.mesh.body.position;
  }

  set position(position: Vector3) {
    this.mesh.body.position = position;
  }

  get rotation(): Vector3 {
    return this.mesh.body.rotation;
  }

  set rotation(rotation: Vector3) {
    this.mesh.body.rotation = rotation;
  }

  public move(): void {
    const speed = this.speed.add(this.gravity);
    this.mesh.body.moveWithCollisions(speed);
    if (speed.x !== 0.0 || speed.z !== 0.0) this.sendPositionToGameServer();
  }

  public readControls(): void {
    this.game.scene.actionManager = new ActionManager(this.game.scene);

    this.game.scene.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyDownTrigger, ((evt) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.keyPressed as any)[evt.sourceEvent.key] = evt.sourceEvent.type === 'keydown';
        this.setSpeedByKeyPress();
      })),
    );

    this.game.scene.actionManager.registerAction(
      new ExecuteCodeAction(ActionManager.OnKeyUpTrigger, ((evt) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.keyPressed as any)[evt.sourceEvent.key] = evt.sourceEvent.type === 'keydown';
        this.setSpeedByKeyPress();
      })),
    );
  }

  public lookAtCursor(): void {
    window.addEventListener('mousemove', () => {
      const pickResult = this.game.scene.pick(this.game.scene.pointerX, this.game.scene.pointerY);

      if (pickResult && pickResult.hit) {
        const direction = pickResult.pickedPoint;
        if (direction) {
          this.direction.x = direction.x - this.mesh.body.position.x;
          this.direction.y = direction.z - this.mesh.body.position.z;

          const angle = Math.atan2(-this.direction.x, -this.direction.y);
          this.mesh.body.rotation.y = angle;
          this.sendPositionToGameServer();
        }
      }
    });
  }

  private setSpeedByKeyPress(): void {
    this.speed.x = 0.0;
    this.speed.z = 0.00001;

    if (this.keyPressed.w || this.keyPressed.ArrowUp) {
      this.speed.x += -this.velocity;
      this.speed.z += this.velocity;
    }

    if (this.keyPressed.a || this.keyPressed.ArrowLeft) {
      this.speed.x += -this.velocity;
      this.speed.z += -this.velocity;
    }

    if (this.keyPressed.s || this.keyPressed.ArrowDown) {
      this.speed.x += this.velocity;
      this.speed.z += -this.velocity;
    }

    if (this.keyPressed.d || this.keyPressed.ArrowRight) {
      this.speed.x += this.velocity;
      this.speed.z += this.velocity;
    }
  }

  private sendPositionToGameServer(): void {
    if (this.game.network.readyState !== Network.STATE.OPEN) return;

    const data = {
      position: {
        x: this.position.x,
        y: this.position.y,
        z: this.position.z,
      },
      rotation: {
        x: this.rotation.x,
        y: this.rotation.y,
        z: this.rotation.z,
      },
    };

    this.game.network.send('movePlayer', data);
  }
}
