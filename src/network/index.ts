/* eslint-disable no-console */
import * as BABYLON from '@babylonjs/core';

export default class Network {
  private readonly connection: WebSocket;

  public readonly onError: BABYLON.Observable<Event>;

  public readonly onUpdate: BABYLON.Observable<{ players: RemotePlayer[] }>;

  public readonly onConnect: BABYLON.Observable<void>;

  public readonly onSyncWorld: BABYLON.Observable<{ players: RemotePlayer[]; grid: number[][] }>;

  public readonly onPlayerJoin: BABYLON.Observable<{ player: RemotePlayer }>;

  public readonly onPlayerQuit: BABYLON.Observable<{ player: RemotePlayer }>;

  public static readonly STATE = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3,
  };

  constructor(private url: string) {
    this.onError = new BABYLON.Observable();
    this.onUpdate = new BABYLON.Observable();
    this.onConnect = new BABYLON.Observable();
    this.onSyncWorld = new BABYLON.Observable();
    this.onPlayerJoin = new BABYLON.Observable();
    this.onPlayerQuit = new BABYLON.Observable();
    this.connection = new WebSocket(this.url);

    this.connection.onopen = (): void => {
      this.onConnect.notifyObservers();
    };

    this.connection.onerror = (err): void => {
      this.onError.notifyObservers(err);
    };

    this.connection.onmessage = (e: MessageEvent): void => {
      try {
        const event = JSON.parse(e.data);
        if (event.name === 'syncWorld') {
          this.onSyncWorld.notifyObservers(event.data);
        } else if (event.name === 'playerJoin') {
          this.onPlayerJoin.notifyObservers(event.data);
        } else if (event.name === 'playerQuit') {
          this.onPlayerQuit.notifyObservers(event.data);
        } else if (event.name === 'update') {
          this.onUpdate.notifyObservers(event.data);
        }
      } catch (err) {
        console.error(err);
      }
    };
  }

  get readyState(): number {
    return this.connection.readyState;
  }

  public async send(event: string, data?: Record<string, unknown>): Promise<void> {
    const request = { name: event, data };
    this.connection.send(JSON.stringify(request));
  }
}
