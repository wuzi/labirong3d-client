import { 
  PointLight,
  Vector3,
  Color3,
  Scene,
  Mesh,
  StandardMaterial,
  HemisphericLight,
} from '@babylonjs/core';

export const sceneLight = (scene: Scene) => {
  const torch = new PointLight("light1", Vector3.Zero(), scene);
  torch.intensity = 0.7;
  torch.diffuse = Color3.FromHexString('#ff9944');
  
  return torch;
}

export const sceneLightImpostor = (scene: Scene, target: Mesh) => {
  var lightImpostor = Mesh.CreateSphere("sphere1", 16, 0.1, scene);
  var lightImpostorMat = new StandardMaterial("mat", scene);
  lightImpostor.material = lightImpostorMat;
  lightImpostorMat.emissiveColor = Color3.Yellow();
  lightImpostorMat.linkEmissiveWithDiffuse = true;
  lightImpostor.position.y = 0;
  lightImpostor.position.z = 0;
  lightImpostor.position.x = 0;
  lightImpostor.parent = target;

  return lightImpostor;
}

export const sceneSky = (scene: Scene) => {
  const sky = new HemisphericLight("sky", new Vector3(0, 1.0, 0), scene);
  sky.intensity = 0.5;

  return sky;
}