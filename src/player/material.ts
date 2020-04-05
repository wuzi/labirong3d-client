import { Color3, Scene, StandardMaterial } from '@babylonjs/core';

export default class PlayerMaterial {
  public readonly body: StandardMaterial;
  public readonly sclera: StandardMaterial;
  public readonly pupil: StandardMaterial;

  constructor(scene: Scene) {
    this.body = new StandardMaterial('pmat', scene);
    this.body.emissiveColor = Color3.FromHexString('#ff9900');
    this.body.specularPower = 64;

    this.sclera = new StandardMaterial('pemat', scene);
    this.sclera.emissiveColor = Color3.FromHexString('#ffffff');
    this.sclera.specularPower = 128;

    this.pupil = new StandardMaterial('pbmat', scene);
    this.pupil.diffuseColor = Color3.Black();
  }
}
