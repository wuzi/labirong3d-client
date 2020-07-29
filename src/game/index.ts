import * as BABYLON from '@babylonjs/core';
import Network from '../network';
import Player from '../player';

export default class Game {
  public readonly canvas: HTMLCanvasElement;

  public readonly engine: BABYLON.Engine;

  public readonly scene: BABYLON.Scene;

  public readonly players: Player[] = [];

  constructor(public readonly network: Network) {
    this.canvas = document.getElementById('canvas') as HTMLCanvasElement;
    this.engine = new BABYLON.Engine(this.canvas, true);
    this.scene = new BABYLON.Scene(this.engine);
    this.network.connection.onopen = (): void => {
      this.syncRemotePlayers();
    };
    if (process.env.NODE_ENV === 'development') {
      this.scene.debugLayer.show();
    }
  }

  public async loadMap(): Promise<void> {
    const { meshes } = await BABYLON.SceneLoader.ImportMeshAsync('', 'assets/', 'village.obj', this.scene);
    meshes.map((m) => {
      const mesh = m;

      if (mesh.name.search('terrain_grass') === -1) {
        mesh.isPickable = false;
      }

      mesh.checkCollisions = true;
      return mesh;
    });
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

  private syncRemotePlayers(): Promise<void> {
    return new Promise(((resolve, reject) => {
      this.network.send('getConnectedPlayers');

      this.network.connection.onmessage = (e: MessageEvent): void => {
        const event = JSON.parse(e.data);
        if (event.name === 'getConnectedPlayers') {
          event.data.players.forEach((remotePlayer: RemotePlayer) => {
            this.addPlayer(remotePlayer);
          });
          resolve(undefined);
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
        reject(err);
      };
    }));
  }
}
