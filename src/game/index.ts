import * as BABYLON from '@babylonjs/core';
import Network from '../network';
import Player from '../player';
import Wall from '../wall';

export default class Game {
  public readonly canvas: HTMLCanvasElement;

  public readonly engine: BABYLON.Engine;

  public readonly scene: BABYLON.Scene;

  public readonly ground: BABYLON.Mesh;

  private readonly skybox: BABYLON.Mesh;

  public readonly players: Player[] = [];

  public grid: number[][] = [];

  constructor(public readonly network: Network) {
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.engine = new BABYLON.Engine(this.canvas, true);
    this.scene = new BABYLON.Scene(this.engine);

    this.skybox = BABYLON.MeshBuilder.CreateBox('skyBox', { size: 1000.0 }, this.scene);
    this.setSkyboxMaterial();

    this.ground = BABYLON.MeshBuilder.CreateTiledGround('gd', {
      xmin: -64, xmax: 64, zmin: -64, zmax: 64, subdivisions: { w: 8, h: 8 },
    });
    this.setGroundMaterial();

    this.network.connection.onopen = (): void => {
      this.network.send('syncWorld');
    };

    this.network.connection.onmessage = (e: MessageEvent): void => {
      const event = JSON.parse(e.data);
      if (event.name === 'syncWorld') {
        event.data.players.forEach((remotePlayer: RemotePlayer) => {
          this.addPlayer(remotePlayer);
        });
        this.grid = event.data.grid;
        this.spawnWalls();
      } else if (event.name === 'playerJoin') {
        this.addPlayer(event.data.player);
      } else if (event.name === 'playerQuit') {
        this.removePlayer(event.data.id);
      } else if (event.name === 'update') {
        event.data.players.forEach((remotePlayer: RemotePlayer) => {
          const player = this.players.find((pl) => pl.id === remotePlayer.id);
          if (!player) return;

          player.position.x = remotePlayer.position.x;
          player.position.y = remotePlayer.position.y;
          player.position.z = remotePlayer.position.z;

          player.rotation.x = remotePlayer.rotation.x;
          player.rotation.y = remotePlayer.rotation.y;
          player.rotation.z = remotePlayer.rotation.z;
        });
      }
    };

    this.network.connection.onerror = (err): void => {
      // eslint-disable-next-line no-console
      console.log(err);
    };

    if (process.env.NODE_ENV === 'development') {
      this.scene.debugLayer.show();
    }
  }

  private async addPlayer(remotePlayer: RemotePlayer): Promise<void> {
    const { meshes, skeletons } = await BABYLON.SceneLoader.ImportMeshAsync('', 'assets/', 'hunter.babylon', this.scene);
    const player = new Player(this, meshes, skeletons, remotePlayer.id);

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
    player.mesh.dispose();
  }

  private spawnWalls(): void {
    const material = new BABYLON.StandardMaterial('', this.scene);
    material.diffuseTexture = new BABYLON.Texture('https://i.imgur.com/LrucUu6.jpg', this.scene);
    this.grid.forEach((tiles, x) => {
      tiles.forEach((tile, z) => {
        if (tile === 1) {
          const wall = new Wall(this.scene, material);
          wall.position = new BABYLON.Vector3((x * 8) - 64, 0, (z * 8) - 64);
        }
      });
    });
  }

  private setSkyboxMaterial(): void {
    const skyboxMaterial = new BABYLON.StandardMaterial('skyBox', this.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture('assets/textures/skybox', this.scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    this.skybox.material = skyboxMaterial;
  }

  private setGroundMaterial(): void {
    const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', this.scene);
    groundMaterial.diffuseTexture = new BABYLON.Texture('assets/textures/floor.png', this.scene);
    this.ground.material = groundMaterial;
  }
}
