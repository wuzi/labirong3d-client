import * as BABYLON from '@babylonjs/core';
import Player from '../player';
import Game from '../game';

export default class Network {
  private connection: WebSocket | undefined;

  public players: Player[];

  constructor(private url: string) {
    this.players = [];
  }

  public connect(): Promise<void> {
    return new Promise(((resolve, reject) => {
      this.connection = new WebSocket(this.url);

      this.connection.onopen = function (): void {
        resolve(undefined);
      };

      this.connection.onerror = function (err): void {
        reject(err);
      };
    }));
  }

  public getClientId(): Promise<number> {
    return new Promise(((resolve, reject) => {
      if (!this.connection) {
        throw new Error('not connected');
      }

      const eventReq = { name: 'getClientId' };
      this.connection.send(JSON.stringify(eventReq));

      this.connection.onmessage = (e: MessageEvent): void => {
        const eventRes = JSON.parse(e.data);
        if (eventRes.name === 'getClientId') {
          resolve(eventRes.data.id);
        }
      };

      this.connection.onerror = function (err): void {
        reject(err);
      };
    }));
  }

  private async addPlayer(game: Game, id: number): Promise<void> {
    const { meshes, skeletons } = await BABYLON.SceneLoader.ImportMeshAsync('', 'assets/', 'hunter.babylon', game.scene);
    const player = new Player(game.scene, meshes, skeletons);

    player.id = id;
    this.players.push(player);
  }

  public listen(game: Game, localPlayer: Player): void {
    if (!this.connection) {
      throw new Error('not connected');
    }

    this.connection.onmessage = async (e: MessageEvent): Promise<void> => {
      if (!this.connection) {
        throw new Error('not connected');
      }

      const eventRes: {
        name: string;
        data: EventResponsePlayer | EventResponsePlayer[];
      } = JSON.parse(e.data);

      if (eventRes.name === 'update') {
        // Update connected players position
        (eventRes.data as EventResponsePlayer[]).forEach((p) => {
          if (p.id === localPlayer.id) return;

          const player = this.players.find((pl) => pl.id === p.id);
          if (player) {
            player.position.x = p.position.x;
            player.position.y = p.position.y;
            player.position.z = p.position.z;

            player.rotation.x = p.rotation.x;
            player.rotation.y = p.rotation.y;
            player.rotation.z = p.rotation.z;
          }
        });

        // Send local player position to server
        const eventReq = {
          name: 'movePlayer',
          data: {
            position: {
              x: localPlayer.position.x,
              y: localPlayer.position.y,
              z: localPlayer.position.z,
            },
            rotation: {
              x: localPlayer.rotation.x,
              y: localPlayer.rotation.y,
              z: localPlayer.rotation.z,
            },
          },
        };
        this.connection.send(JSON.stringify(eventReq));
      } else if (eventRes.name === 'playerJoin') {
        this.addPlayer(game, (eventRes.data as EventResponsePlayer).id);
      } else if (eventRes.name === 'playerQuit') {
        const player = this.players.find((p) => p.id === (eventRes.data as EventResponsePlayer).id);
        if (!player) {
          return;
        }

        this.players.splice(this.players.indexOf(player), 1);
        player.mesh.dispose();
      }
    };
  }
}
