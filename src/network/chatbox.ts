import * as BABYLON from '@babylonjs/core';
import KeyCode from '../constants/keycode';

export default class Chatbox {
  private element: HTMLDivElement;

  constructor(
    private readonly scene: BABYLON.Scene,
    private readonly canvas: HTMLCanvasElement,
  ) {
    this.element = document.createElement('div');
    this.element.style.display = 'none';
    this.element.id = 'chatbox';
    document.body.appendChild(this.element);

    this.scene.onKeyboardObservable.add((e) => {
      switch (e.event.keyCode) {
        case KeyCode.ENTER:
          this.focus();
          break;
        default:
          break;
      }
    });

    this.configChatElements();
  }

  public show(): void {
    this.element.style.display = 'flex';
  }

  public blur(): void {
    const input = document.getElementById('chatboxwrite');
    if (input) {
      input.blur();
      this.canvas.focus();
    }
  }

  public focus(): void {
    const input = document.getElementById('chatboxwrite');
    if (input) {
      input.focus();
    }
  }

  private configChatElements(): void {
    const readArea = document.createElement('div');
    readArea.classList.add('chatbox__read');
    this.element.appendChild(readArea);

    const fakeMessages = [
      { owner: 'Wuzi', message: 'Hi!', color: '#ff0000' },
      { owner: 'Igon', message: 'Hi there :)', color: '#8c00ff' },
    ];

    fakeMessages.map((fakeMessage) => {
      const messageElement = document.createElement('div');
      const messageOwner = document.createElement('span');
      const message = document.createElement('span');

      messageOwner.textContent = `${fakeMessage.owner}:`;
      message.textContent = fakeMessage.message;

      messageElement.classList.add('chatbox__read__container');
      messageOwner.classList.add('chatbox__read__owner');
      message.classList.add('chatbox__read__message');

      messageOwner.style.color = fakeMessage.color;

      messageElement.appendChild(messageOwner);
      messageElement.appendChild(message);

      readArea.appendChild(messageElement);

      return messageElement;
    });

    const writeArea = document.createElement('input');
    writeArea.classList.add('chatbox__write');
    writeArea.id = 'chatboxwrite';
    writeArea.onkeydown = (e: KeyboardEvent): void => {
      switch (e.keyCode) {
        case KeyCode.ESCAPE:
          this.blur();
          break;
        default:
          break;
      }
    };

    this.element.appendChild(writeArea);
  }
}
