import { Mesh, Scene, Vector3 } from '@babylonjs/core';
import PlayerMaterial from './material';

export default class PlayerMesh {
  public readonly body: Mesh;
  public readonly leftSclera: Mesh;
  public readonly rightSclera: Mesh;
  public readonly leftPupil: Mesh;
  public readonly rightPupil: Mesh;

  constructor(scene: Scene) {
    const material = new PlayerMaterial(scene);

    this.body = Mesh.CreateSphere('playerbody', 8, 1.8, scene);
    this.body.material = material.body;
    this.body.position.y = 0.9;
    this.body.checkCollisions = true;
    this.body.ellipsoid = new Vector3(0.9, 0.45, 0.9);

    this.leftSclera = Mesh.CreateSphere('eye1', 8, 0.5, scene);
    this.leftSclera.material = material.sclera;
    this.leftSclera.position.y = 0.5;
    this.leftSclera.position.z = 0.5;
    this.leftSclera.position.x = -0.3;
    this.leftSclera.parent = this.body;

    this.rightSclera = Mesh.CreateSphere("eye2", 8, 0.5, scene);
    this.rightSclera.material = material.sclera;
    this.rightSclera.position.y = 0.5;
    this.rightSclera.position.z = 0.5;
    this.rightSclera.position.x = 0.3;
    this.rightSclera.parent = this.body;

    this.leftPupil = Mesh.CreateSphere("eye1b", 8, 0.25, scene);
    this.leftPupil.material = material.pupil;
    this.leftPupil.position.y = 0.5;
    this.leftPupil.position.z = 0.7;
    this.leftPupil.position.x = -0.3;
    this.leftPupil.parent = this.body;

    this.rightPupil = Mesh.CreateSphere("eye2b", 8, 0.25, scene);
    this.rightPupil.material = material.pupil;
    this.rightPupil.position.y = 0.5;
    this.rightPupil.position.z = 0.7;
    this.rightPupil.position.x = 0.3;
    this.rightPupil.parent = this.body;
  }
}
