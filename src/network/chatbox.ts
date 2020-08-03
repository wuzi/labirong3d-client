export default class Chatbox {
  private element: HTMLDivElement;

  constructor() {
    this.element = document.createElement('div');
    this.element.id = 'chatbox';

    this.element.style.position = 'absolute';
    this.element.style.bottom = '5%';
    this.element.style.left = '5px';
    this.element.style.border = '5pt inset blue';
    this.element.style.width = '300px';
    this.element.style.height = '150px';
    this.element.style.display = 'block';

    document.body.appendChild(this.element);
  }

  public show(): void {
    this.element.style.display = 'block';
  }

  public hide(): void {
    this.element.style.display = 'none';
  }
}
