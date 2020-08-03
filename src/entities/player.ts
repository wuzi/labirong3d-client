import * as BABYLON from '@babylonjs/core';
import Network from '../network';

export default class Player {
  public readonly mesh: BABYLON.Mesh;

  private readonly skeleton: BABYLON.Skeleton;

  private readonly velocity = 0.1;

  private readonly speed: BABYLON.Vector3;

  private readonly idleRange: BABYLON.Nullable<BABYLON.AnimationRange>;

  private readonly walkingRange: BABYLON.Nullable<BABYLON.AnimationRange>;

  private readonly backwardsRange: BABYLON.Nullable<BABYLON.AnimationRange>;

  private angle: number;

  private keyPressed: Input;

  private currentAnimation: 'Idle' | 'Walking' | 'Backwards';

  constructor(
    private readonly scene: BABYLON.Scene,
    mesh: BABYLON.AbstractMesh,
    skeleton: BABYLON.Skeleton,
    material: BABYLON.StandardMaterial,
    private readonly network: Network,
    public readonly id: number | undefined = undefined,
  ) {
    this.mesh = mesh as BABYLON.Mesh;
    this.mesh.scaling = new BABYLON.Vector3(0.015, 0.015, 0.015);
    this.mesh.material = material;

    this.skeleton = skeleton;
    this.skeleton.animationPropertiesOverride = new BABYLON.AnimationPropertiesOverride();
    this.skeleton.animationPropertiesOverride.enableBlending = true;
    this.skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
    this.skeleton.animationPropertiesOverride.loopMode = 1;

    this.idleRange = this.skeleton.getAnimationRange('Idle');
    this.walkingRange = this.skeleton.getAnimationRange('Walking');
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (this.keyPressed as any)[evt.sourceEvent.key] = evt.sourceEvent.type === 'keydown';
        this.setSpeedByKeyPress();
      })),
    );

    this.scene.actionManager.registerAction(
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

    if (this.keyPressed.w) {
      this.playAnim('Walking');
      this.speed.x += -this.mesh.forward.x / 25;
      this.speed.z += -this.mesh.forward.z / 25;
    } else if (this.keyPressed.s) {
      this.playAnim('Backwards');
      this.speed.x += this.mesh.forward.x / 50;
      this.speed.z += this.mesh.forward.z / 50;
    } else if (!this.keyPressed.w && !this.keyPressed.s) {
      this.playAnim('Idle');
    }

    if (this.keyPressed.a) {
      this.angle = -this.velocity;
    } else if (this.keyPressed.d) {
      this.angle = this.velocity;
    }
  }

  private playAnim(name: 'Idle' | 'Walking' | 'Backwards'): void {
    if (name === this.currentAnimation) {
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
    };

    this.network.send('movePlayer', data);
  }
}
