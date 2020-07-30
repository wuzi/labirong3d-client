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

  private angle: number;

  private keyPressed: Input;

  constructor(
    private game: Game,
    meshes: AbstractMesh[],
    skeletons: Skeleton[],
    public readonly id: number | undefined = undefined,
  ) {
    this.mesh = new PlayerMesh(game.scene, meshes[0], skeletons[0]);
    this.mesh.body.position.x = this.getRandomSpawn();
    this.mesh.body.position.z = 8 - 64;

    this.angle = 0;
    this.speed = new Vector3(0, 0, 0);
    this.gravity = new Vector3(0, -this.velocity, 0);

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

    this.mesh.body.rotation.y += this.angle;
    this.mesh.body.moveWithCollisions(speed);

    if (speed.x !== 0.0 || speed.z !== 0.0 || this.angle !== 0) {
      this.sendPositionToGameServer();
    }
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

  private setSpeedByKeyPress(): void {
    this.angle = 0;
    this.speed.x = 0.0;
    this.speed.z = 0.0;

    if (this.keyPressed.w || this.keyPressed.ArrowUp) {
      this.speed.x += -this.mesh.body.forward.x / 10;
      this.speed.z += -this.mesh.body.forward.z / 10;
    } else if (this.keyPressed.s || this.keyPressed.ArrowDown) {
      this.speed.x += this.mesh.body.forward.x / 10;
      this.speed.z += this.mesh.body.forward.z / 10;
    }

    if (this.keyPressed.a || this.keyPressed.ArrowLeft) {
      this.angle = -this.velocity;
    } else if (this.keyPressed.d || this.keyPressed.ArrowRight) {
      this.angle = this.velocity;
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

  private getRandomSpawn(): number {
    const spawns = [];
    for (let x = 0; x < this.game.grid.length; x++) {
      if (this.game.grid[x][1] === 0) {
        spawns.push(x);
      }
    }

    if (spawns.length < 1) {
      return 0;
    }

    return (spawns[Math.floor(Math.random() * this.game.grid.length)] * 8) - 64;
  }
}
