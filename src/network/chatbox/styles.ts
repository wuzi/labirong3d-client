export function setChatStyle(): void {
  const style = document.createElement('style');

  style.innerHTML = `
    @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

    #chatbox {
      position: absolute;
      bottom: 5%;
      left: 5px;
      width: 400px;
      height: auto;
      display: flex;
      flex-direction: column;
      user-select: none;
    }

    .chatbox__read {
      width: 100%;
      height: 150px;
      background: rgba(0, 0, 0, .25);
      overflow: scroll;
      overflow-x: hidden;
    }

    .chatbox__read__container {
      display: flex;
      margin: 10px 7px;
      font-family: 'Roboto';
      font-size: 18px
    }

    .chatbox__read__owner {
      font-weight: bold;
    }

    .chatbox__read__message {
      color: white;
      margin-left: 5px;
      word-break: break-word;
    }

    .chatbox__write {
      width: auto;
      height: 30px;
      background: rgba(0, 0, 0, .45);
      border: none;
      color: white;
      padding: 3px 10px;
    }

    .chatbox__write:focus {
      background: rgba(0, 0, 0, .7);
    }

    ::-webkit-scrollbar {
      width: 10px;
    }

    ::-webkit-scrollbar-track {
      background: rgba(0, 0, 0, .55); 
    }
    
    ::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 1); 
    }

    ::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 1); 
    }
  `;

  document.head.appendChild(style);
}

export default setChatStyle;
