import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessagingService {

  constructor() { }
  private subject = new Subject<any>();

  sendMessage(message: string){
    this.subject.next("false");
  }

  getMessage(): Observable<any> {
    return this.subject.asObservable();
}
}
