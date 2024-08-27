import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SseService {
  private eventSource!: EventSource;
  private eventsSubject = new Subject<any>();

  constructor() { }

  public connect(): void {
    this.eventSource = new EventSource('https://tgmini.ru:8443/events');
    alert('connected');
    this.eventSource.onmessage = (event) => {
      // alert('Event received:');
      // const data = JSON.parse(event.data);
      console.log('New message from server:', event.data);
      const data = JSON.parse(event.data);
      this.eventsSubject.next(data);
    };

    this.eventSource.onerror = (error) => {
      alert('errrrrrrrr');
      console.log(error);
      // console.error('EventSource failed:', error);
      this.eventSource.close();
    };
  }

  public getEvents() {
    return this.eventsSubject.asObservable();
  }

  public disconnect(): void {
    if (this.eventSource) {
      this.eventSource.close();
    }
  }
}
