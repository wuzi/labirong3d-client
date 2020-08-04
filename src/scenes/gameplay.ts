import * as BABYLON from '@babylonjs/core';

import Camera from '../entities/camera';
import Chatbox from '../network/chatbox';
import Ground from '../entities/ground';
import Player from '../entities/player';
import Skybox from '../entities/skybox';
import Sunlight from '../entities/sunlight';
import Torch from '../entities/torch';
import Wall from '../entities/wall';
import Network from '../network';

export default class GameplayScene {
  public readonly scene: BABYLON.Scene;

  public readonly ground: Ground;

  public readonly skybox: Skybox;

  public readonly camera: Camera;

  public readonly players: Player[] = [];

  private grid: number[][] = [];

  private player: Player | undefined;

  private characterMeshTask: BABYLON.MeshAssetTask;

  private characterTextureTask: BABYLON.TextureAssetTask;

  private characterMaterial: BABYLON.StandardMaterial;

  constructor(
    private readonly engine: BABYLON.Engine,
    private readonly canvas: HTMLCanvasElement,
    public readonly network: Network,
  ) {
    this.engine.displayLoadingUI();

    this.scene = new BABYLON.Scene(this.engine);
    this.skybox = new Skybox(this.scene);
    this.ground = new Ground(this.scene);
    this.camera = new Camera(this.scene, this.canvas);
    this.characterMaterial = new BABYLON.StandardMaterial('characterMat', this.scene);

    // Create chatbox
    const chatbox = new Chatbox(this.canvas);

    // Lighting configuration
    const torch = new Torch(this.scene);
    torch.intensity = 1;

    const sunlight = new Sunlight(this.scene);
    sunlight.intensity = 0.5;

    // Load assets
    const assetsManager = new BABYLON.AssetsManager(this.scene);
    this.characterMeshTask = assetsManager.addMeshTask('characterMesh', '', 'assets/', 'character.babylon');
    this.characterTextureTask = assetsManager.addTextureTask('characterTexture', 'assets/textures/character.png');

    assetsManager.onTasksDoneObservable.add((): void => {
      this.characterMaterial.diffuseTexture = this.characterTextureTask.texture;

      this.player = new Player(
        this.scene,
        this.characterMeshTask.loadedMeshes[0],
        this.characterMeshTask.loadedSkeletons[0],
        this.characterMaterial,
        this.network,
      );
      this.player.position = this.getRandomSpawn();
      this.player.readControls();
      this.camera.lockTarget(this.player.mesh);

      // Do stuff before render
      this.scene.registerBeforeRender(() => {
        if (this.player) {
          this.player.move();
          torch.copyPositionFrom(this.player.position);
        }
      });

      chatbox.show();
    });

    this.network.onConnect.add(() => {
      this.network.send('syncWorld');
    });

    this.network.onSyncWorld.add((data) => {
      data.players.forEach((remotePlayer: RemotePlayer) => {
        this.addPlayer(remotePlayer);
      });
      this.grid = data.grid;
      this.spawnWalls();
      assetsManager.load();
    });

    this.network.onPlayerJoin.add((data) => {
      this.addPlayer(data.player);
    });

    this.network.onPlayerQuit.add((data) => {
      this.removePlayer(data.player.id);
    });

    this.network.onUpdate.add((data) => {
      data.players.forEach((remotePlayer: RemotePlayer) => {
        const player = this.players.find((pl) => pl.id === remotePlayer.id);
        if (!player) return;

        player.position.x = remotePlayer.position.x;
        player.position.y = remotePlayer.position.y;
        player.position.z = remotePlayer.position.z;

        player.rotation.x = remotePlayer.rotation.x;
        player.rotation.y = remotePlayer.rotation.y;
        player.rotation.z = remotePlayer.rotation.z;

        player.playAnim(remotePlayer.currentAnimation);
      });
    });

    if (process.env.NODE_ENV === 'development') {
      this.scene.debugLayer.show();
    }
  }

  public getRandomSpawn(): BABYLON.Vector3 {
    const spawns = [];
    const position = new BABYLON.Vector3(0, 0, 8 - 64);

    for (let x = 0; x < this.grid.length; x++) {
      if (this.grid[x][1] === 0) {
        spawns.push(x);
      }
    }

    if (spawns.length > 0) {
      position.x = (spawns[Math.floor(Math.random() * this.grid.length)] * 8) - 64;
    }

    return position;
  }

  private async addPlayer(remotePlayer: RemotePlayer): Promise<void> {
    const { meshes, skeletons } = await BABYLON.SceneLoader.ImportMeshAsync('', 'assets/', 'character.babylon', this.scene);

    const player = new Player(
      this.scene,
      meshes[0],
      skeletons[0],
      this.characterMaterial,
      this.network,
      remotePlayer.id,
    );

    player.position.x = remotePlayer.position.x;
    player.position.y = remotePlayer.position.y;
    player.position.z = remotePlayer.position.z;

    player.rotation.x = remotePlayer.rotation.x;
    player.rotation.y = remotePlayer.rotation.y;
    player.rotation.z = remotePlayer.rotation.z;

    this.players.push(player);
  }

  private async removePlayer(id: number): Promise<void> {
    const player = this.players.find((p) => p.id === id);
    if (!player) return;

    this.players.splice(this.players.indexOf(player), 1);
    player.dispose();
  }

  private spawnWalls(): void {
    const material = new BABYLON.StandardMaterial('', this.scene);
    material.diffuseTexture = new BABYLON.Texture('assets/textures/brick.png', this.scene);

    const options = {
      sideOrientation: BABYLON.Mesh.DOUBLESIDE,
      pattern: BABYLON.Mesh.FLIP_TILE,
      alignVertical: BABYLON.Mesh.TOP,
      alignHorizontal: BABYLON.Mesh.LEFT,
      width: 8,
      height: 16,
      depth: 8,
      tileSize: 1,
      tileWidth: 3,
    };

    const box = BABYLON.MeshBuilder.CreateTiledBox('', options, this.scene);
    box.material = material;

    this.grid.forEach((tiles, x) => {
      tiles.forEach((tile, z) => {
        if (tile === 1) {
          const wall = new Wall(box);
          wall.position = new BABYLON.Vector3((x * 8) - 64, 0, (z * 8) - 64);
        }
      });
    });
  }
}
