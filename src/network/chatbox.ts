import KeyCode from '../constants/keycode';

export default class Chatbox {
  private element: HTMLDivElement;

  private readArea: HTMLDivElement;

  private writeArea: HTMLInputElement;

  constructor(
    private readonly canvas: HTMLCanvasElement,
  ) {
    this.element = document.createElement('div');
    this.element.style.display = 'none';
    this.element.id = 'chatbox';
    document.body.appendChild(this.element);

    this.readArea = document.createElement('div');
    this.readArea.classList.add('chatbox__read');
    this.element.appendChild(this.readArea);

    this.writeArea = document.createElement('input');
    this.writeArea.classList.add('chatbox__write');
    this.writeArea.id = 'chatboxwrite';
    this.element.appendChild(this.writeArea);

    this.attachControl();
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

  public appendMessage(message: string, author: string, color = '#ff0000'): void {
    const messageElement = document.createElement('div');
    const messageAuthor = document.createElement('span');
    const spanElement = document.createElement('span');

    messageAuthor.textContent = `${author}:`;
    spanElement.textContent = message;

    messageElement.classList.add('chatbox__read__container');
    messageAuthor.classList.add('chatbox__read__author');
    spanElement.classList.add('chatbox__read__message');

    messageAuthor.style.color = color;

    messageElement.appendChild(messageAuthor);
    messageElement.appendChild(spanElement);

    this.readArea.appendChild(messageElement);
  }

  private attachControl(): void {
    this.canvas.onkeydown = (e: KeyboardEvent): void => {
      switch (e.keyCode) {
        case KeyCode.ENTER:
          this.focus();
          break;
        default:
          break;
      }
    };

    this.writeArea.onkeydown = (e: KeyboardEvent): void => {
      switch (e.keyCode) {
        case KeyCode.ESCAPE:
        case KeyCode.ENTER:
          this.blur();
          break;
        default:
          break;
      }
    };
  }
}
