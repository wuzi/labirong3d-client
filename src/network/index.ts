/* eslint-disable no-console */
import * as BABYLON from '@babylonjs/core';
import { RemotePlayerDTO } from './dto/remote-player.dto';

export default class Network {
  private readonly connection: WebSocket;

  public readonly onError: BABYLON.Observable<Event>;

  public readonly onUpdate: BABYLON.Observable<{ players: RemotePlayerDTO[] }>;

  public readonly onConnect: BABYLON.Observable<void>;

  public readonly onChatMessage: BABYLON.Observable<{ player: RemotePlayerDTO; message: string }>;

  public readonly onSyncWorld: BABYLON.Observable<{ players: RemotePlayerDTO[]; grid: number[][] }>;

  public readonly onMapRegen: BABYLON.Observable<{ grid: number[][] }>;

  public readonly onPlayerJoin: BABYLON.Observable<{ player: RemotePlayerDTO }>;

  public readonly onPlayerQuit: BABYLON.Observable<{ player: RemotePlayerDTO }>;

  public readonly onPlayerEscape: BABYLON.Observable<{ player: RemotePlayerDTO }>;

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
    this.onMapRegen = new BABYLON.Observable();
    this.onPlayerJoin = new BABYLON.Observable();
    this.onChatMessage = new BABYLON.Observable();
    this.onPlayerQuit = new BABYLON.Observable();
    this.onPlayerEscape = new BABYLON.Observable();
    this.connection = new WebSocket(this.url);

    this.connection.onopen = (): void => {
      this.onConnect.notifyObservers();
    };

    this.connection.onerror = (err): void => {
      this.onError.notifyObservers(err);
    };

    this.connection.onmessage = (e: MessageEvent): void => {
      const events: string[] = e.data.split(/\r?\n/);
      events.forEach((data): void => {
        try {
          const event = JSON.parse(data);
          if (event.name === 'syncWorld') {
            this.onSyncWorld.notifyObservers(event.data);
          } else if (event.name === 'onMapRegen') {
            this.onMapRegen.notifyObservers(event.data);
          } else if (event.name === 'playerJoin') {
            this.onPlayerJoin.notifyObservers(event.data);
          } else if (event.name === 'playerQuit') {
            this.onPlayerQuit.notifyObservers(event.data);
          } else if (event.name === 'update') {
            this.onUpdate.notifyObservers(event.data);
          } else if (event.name === 'chatMessage') {
            this.onChatMessage.notifyObservers(event.data);
          } else if (event.name === 'onPlayerEscape') {
            this.onPlayerEscape.notifyObservers(event.data);
          }
        } catch (err) {
          console.error(err);
        }
      });
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
