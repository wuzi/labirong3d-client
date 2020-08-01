import * as BABYLON from '@babylonjs/core';

import Game from '../game';
import Network from '../network';

export default class Player {
  public readonly mesh: BABYLON.Mesh;

  private readonly skeleton: BABYLON.Skeleton;

  private readonly velocity = 0.1;

  private readonly speed: BABYLON.Vector3;

  private angle: number;

  private keyPressed: Input;

  constructor(
    private game: Game,
    meshes: BABYLON.AbstractMesh[],
    skeletons: BABYLON.Skeleton[],
    public readonly id: number | undefined = undefined,
  ) {
    this.mesh = meshes[0] as BABYLON.Mesh;
    this.mesh.scaling = new BABYLON.Vector3(0.015, 0.015, 0.015);
    this.mesh.position.x = this.getRandomSpawn();
    this.mesh.position.z = 8 - 64;

    this.skeleton = skeletons[0] as BABYLON.Skeleton;
    this.skeleton.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
    this.skeleton.animationPropertiesOverride.enableBlending = true;
    this.skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
    this.skeleton.animationPropertiesOverride.loopMode = 1;

    const idleRange = this.skeleton.getAnimationRange('Idle');
    if (idleRange) {
      this.game.scene.beginAnimation(this.skeleton, idleRange.from, idleRange.to, true);
    }

    this.angle = 0;
    this.speed = new BABYLON.Vector3(0, 0, 0);

    this.keyPressed = {};
  }

  get position(): BABYLON.Vector3 {
    return this.mesh.position;
  }

  set position(position: BABYLON.Vector3) {
    this.mesh.position = position;
  }

  get rotation(): BABYLON.Vector3 {
    return this.mesh.rotation;
  }

  set rotation(rotation: BABYLON.Vector3) {
    this.mesh.rotation = rotation;
  }

  public move(): void {
    this.mesh.rotation.y += this.angle;
    this.mesh.moveWithCollisions(this.speed);

    if (this.speed.x !== 0.0 || this.speed.z !== 0.0 || this.angle !== 0) {
      this.sendPositionToGameServer();
    }
  }

  public readControls(): void {
    this.game.scene.actionManager = new BABYLON.ActionManager(this.game.scene);

    this.game.scene.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, ((evt) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.keyPressed as any)[evt.sourceEvent.key] = evt.sourceEvent.type === 'keydown';
        this.setSpeedByKeyPress();
      })),
    );

    this.game.scene.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, ((evt) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.keyPressed as any)[evt.sourceEvent.key] = evt.sourceEvent.type === 'keydown';
        this.setSpeedByKeyPress();
      })),
    );
  }

  public dispose(): void {
    this.mesh.dispose();
    this.skeleton.dispose();
  }

  private setSpeedByKeyPress(): void {
    this.angle = 0;
    this.speed.x = 0.0;
    this.speed.z = 0.0;

    if (this.keyPressed.w || this.keyPressed.ArrowUp) {
      this.speed.x += -this.mesh.forward.x / 10;
      this.speed.z += -this.mesh.forward.z / 10;
    } else if (this.keyPressed.s || this.keyPressed.ArrowDown) {
      this.speed.x += this.mesh.forward.x / 20;
      this.speed.z += this.mesh.forward.z / 20;
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
