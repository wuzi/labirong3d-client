import {
  Scene, Vector3, AnimationPropertiesOverride, AbstractMesh, Skeleton, Mesh,
} from '@babylonjs/core';

export default class PlayerMesh {
  public readonly body: Mesh;

  constructor(scene: Scene, mesh: AbstractMesh, private skeleton: Skeleton) {
    this.body = mesh as Mesh;
    this.body.scaling = new Vector3(0.015, 0.015, 0.015);

    this.skeleton.animationPropertiesOverride = new AnimationPropertiesOverride();
    this.skeleton.animationPropertiesOverride.enableBlending = true;
    this.skeleton.animationPropertiesOverride.blendingSpeed = 0.05;
    this.skeleton.animationPropertiesOverride.loopMode = 1;

    const idleRange = this.skeleton.getAnimationRange('Run');
    if (idleRange) scene.beginAnimation(this.skeleton, idleRange.from, idleRange.to, true);
  }
}
