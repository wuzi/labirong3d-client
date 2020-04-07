import * as BABYLON from '@babylonjs/core';
import Player from '../player';
import Game from '../game';

export default class Network {
  private connection: WebSocket | undefined;

  public players: Player[];

  private localPlayerId: number;

  constructor(private url: string) {
    this.players = [];
    this.localPlayerId = -1;
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
          this.localPlayerId = eventRes.data.id;
          resolve(eventRes.data.id);
        }
      };

      this.connection.onerror = function (err): void {
        reject(err);
      };
    }));
  }

  public listen(game: Game): void {
    if (!this.connection) {
      throw new Error('not connected');
    }

    this.connection.onmessage = (e: MessageEvent): void => {
      const eventRes: {
        name: string;
        data: {
          id: number;
          position: {
            x: number;
            y: number;
            z: number;
          };
        }[];
      } = JSON.parse(e.data);

      if (eventRes.name === 'update') {
        // Remove disconnected players
        this.players.forEach((player) => {
          if (player.id === this.localPlayerId) return;

          if (!eventRes.data.some((p) => p.id === player.id)) {
            this.players.splice(this.players.indexOf(player), 1);
            player.mesh.dispose();
          }
        });

        // Add new players
        eventRes.data.forEach(async (p) => {
          if (p.id === this.localPlayerId) return;

          if (!this.players.some((player) => p.id === player.id)) {
            const { meshes, skeletons } = await BABYLON.SceneLoader.ImportMeshAsync('', 'assets/', 'hunter.babylon', game.scene);
            const player = new Player(game.scene, meshes, skeletons);

            player.id = p.id;
            this.players.push(player);
          }
        });
      }
    };
  }
}
