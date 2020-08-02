import * as BABYLON from '@babylonjs/core';
import Network from '../network';
import Player from '../entities/player';
import Wall from '../entities/wall';
import Skybox from '../entities/skybox';
import Ground from '../entities/ground';

export default class GameplayScene {
  public readonly canvas: HTMLCanvasElement;

  public readonly engine: BABYLON.Engine;

  public readonly scene: BABYLON.Scene;

  public readonly ground: Ground;

  public readonly skybox: Skybox;

  public readonly players: Player[] = [];

  public grid: number[][] = [];

  constructor(public readonly network: Network) {
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.engine = new BABYLON.Engine(this.canvas, true);
    this.scene = new BABYLON.Scene(this.engine);
    this.skybox = new Skybox(this.scene);
    this.ground = new Ground(this.scene);

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

  public getRandomSpawn(): number {
    const spawns = [];
    for (let x = 0; x < this.grid.length; x++) {
      if (this.grid[x][1] === 0) {
        spawns.push(x);
      }
    }

    if (spawns.length < 1) {
      return 0;
    }

    return (spawns[Math.floor(Math.random() * this.grid.length)] * 8) - 64;
  }

  private async addPlayer(remotePlayer: RemotePlayer): Promise<void> {
    const { meshes, skeletons } = await BABYLON.SceneLoader.ImportMeshAsync('', 'assets/', 'hunter.babylon', this.scene);
    const player = new Player(this.scene, meshes[0], skeletons[0], this.network, remotePlayer.id);

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
