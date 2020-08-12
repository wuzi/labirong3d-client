import * as BABYLON from '@babylonjs/core';
import Network from '../network';

export default class Player {
  public readonly id?: number;

  public readonly name: string;

  public readonly color: string;

  public readonly mesh: BABYLON.Mesh;

  private readonly skeleton: BABYLON.Skeleton;

  private readonly velocity = 0.1;

  private readonly speed: BABYLON.Vector3;

  private readonly idleRange: BABYLON.Nullable<BABYLON.AnimationRange>;

  private readonly jumpRange: BABYLON.Nullable<BABYLON.AnimationRange>;

  private readonly walkingRange: BABYLON.Nullable<BABYLON.AnimationRange>;

  private readonly runningRange: BABYLON.Nullable<BABYLON.AnimationRange>;

  private readonly backwardsRange: BABYLON.Nullable<BABYLON.AnimationRange>;

  private angle: number;

  private isJumping = false;

  private keyPressed: Input;

  public currentAnimation: 'Idle' | 'Walking' | 'Backwards' | 'Running' | 'Jump';

  constructor(
    private readonly scene: BABYLON.Scene,
    mesh: BABYLON.AbstractMesh,
    skeleton: BABYLON.Skeleton,
    material: BABYLON.StandardMaterial,
    playerData: { id?: number; name: string; color: string },
    private readonly network: Network,
  ) {
    this.id = playerData.id;
    this.name = playerData.name;
    this.color = playerData.color;

    this.mesh = mesh as BABYLON.Mesh;
    this.mesh.scaling = new BABYLON.Vector3(0.015, 0.015, 0.015);
    this.mesh.material = material;

    this.skeleton = skeleton;
    this.skeleton.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
    this.skeleton.animationPropertiesOverride.enableBlending = true;
    this.skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
    this.skeleton.animationPropertiesOverride.loopMode = 1;

    this.idleRange = this.skeleton.getAnimationRange('Idle');
    this.jumpRange = this.skeleton.getAnimationRange('Jump');
    this.walkingRange = this.skeleton.getAnimationRange('Walking');
    this.runningRange = this.skeleton.getAnimationRange('Running');
    this.backwardsRange = this.skeleton.getAnimationRange('Backwards');

    this.playAnim('Idle');
    this.currentAnimation = 'Idle';

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
    this.scene.actionManager = new BABYLON.ActionManager(this.scene);

    this.scene.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, ((evt) => {
        this.keyPressed[evt.sourceEvent.code as keyof Input] = evt.sourceEvent.type === 'keydown';
        this.setSpeedByKeyPress();
      })),
    );

    this.scene.actionManager.registerAction(
      new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, ((evt) => {
        this.keyPressed[evt.sourceEvent.code as keyof Input] = evt.sourceEvent.type === 'keydown';
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

    if (this.keyPressed.Space) {
      this.playAnim('Jump');
    }

    if (this.keyPressed.KeyW && this.keyPressed.ShiftLeft) {
      this.playAnim('Running');
      this.speed.x += -this.mesh.forward.x / 10;
      this.speed.z += -this.mesh.forward.z / 10;
    } else if (this.keyPressed.KeyW) {
      this.playAnim('Walking');
      this.speed.x += -this.mesh.forward.x / 25;
      this.speed.z += -this.mesh.forward.z / 25;
    } else if (this.keyPressed.KeyS) {
      this.playAnim('Backwards');
      this.speed.x += this.mesh.forward.x / 50;
      this.speed.z += this.mesh.forward.z / 50;
    } else if (!this.keyPressed.KeyW && !this.keyPressed.KeyS) {
      this.playAnim('Idle');
      this.sendPositionToGameServer();
    }

    if (this.keyPressed.KeyA) {
      this.angle = -this.velocity;
    } else if (this.keyPressed.KeyD) {
      this.angle = this.velocity;
    }
  }

  private setAnimByKeyPress(): void {
    if (this.keyPressed.KeyW && this.keyPressed.ShiftLeft) {
      this.playAnim('Running');
    } else if (this.keyPressed.KeyW) {
      this.playAnim('Walking');
    } else if (this.keyPressed.KeyS) {
      this.playAnim('Backwards');
    } else {
      this.playAnim('Idle');
    }
  }

  public playAnim(name: 'Idle' | 'Walking' | 'Backwards' | 'Running' | 'Jump'): void {
    if (name === this.currentAnimation || this.isJumping) {
      return;
    }

    if (name === 'Idle') {
      if (this.idleRange) {
        this.scene.beginAnimation(
          this.skeleton, this.idleRange.from, this.idleRange.to, true,
        );
      }
    } else if (name === 'Walking') {
      if (this.walkingRange) {
        this.scene.beginAnimation(
          this.skeleton, this.walkingRange.from, this.walkingRange.to, true,
        );
      }
    } else if (name === 'Backwards') {
      if (this.backwardsRange) {
        this.scene.beginAnimation(
          this.skeleton, this.backwardsRange.from, this.backwardsRange.to, true,
        );
      }
    } else if (name === 'Running') {
      if (this.runningRange) {
        this.scene.beginAnimation(
          this.skeleton, this.runningRange.from, this.runningRange.to, true,
        );
      }
    } else if (name === 'Jump') {
      if (this.jumpRange) {
        this.isJumping = true;
        this.scene.beginAnimation(
          this.skeleton, this.jumpRange.from, this.jumpRange.to, false, 1.0, () => {
            this.isJumping = false;
            this.setAnimByKeyPress();
          },
        );
      }
    }

    this.currentAnimation = name;
  }

  private sendPositionToGameServer(): void {
    if (this.network.readyState !== Network.STATE.OPEN) return;

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
      currentAnimation: this.currentAnimation,
    };

    this.network.send('movePlayer', data);
  }
}
