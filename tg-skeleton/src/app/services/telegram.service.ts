import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

interface TgButton {
  show(): void;
  hide(): void;
  setText(text: string): void;
  onClick(fn: Function): void;
  offClick(fn: Function): void;
  setParams(params: object): void;
}

@Injectable({
  providedIn: 'root'
})
export class TelegramService {
  private window;
  tg: any;
  chatId: any;
  constructor(@Inject(DOCUMENT) private _document: any) {
    this.window = this._document.defaultView;
    this.tg = this.window.Telegram.WebApp;
    this.chatId = this.window.Telegram.WebApp.initDataUnsafe.chat.id;

  }

  get MainButton(): TgButton {
    return this.tg.MainButton;
  }

  get BackButton(): TgButton {
    return this.tg.BackButton;
  }

  sendData(data: object) {
    this.tg.sendData(JSON.stringify(data));
  }

  ready() {
    this.tg.ready()
  }
}
