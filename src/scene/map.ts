import { SceneLoader, Scene } from '@babylonjs/core';

const loadMap = async (scene: Scene): Promise<void> => {
  const { meshes } = await SceneLoader.ImportMeshAsync('', 'assets/', 'village.obj', scene);
  meshes.map((m) => {
    const mesh = m;

    if (mesh.name.search('terrain_grass') === -1) {
      mesh.isPickable = false;
    }

    mesh.checkCollisions = true;
    return mesh;
  });
};

export default loadMap;
