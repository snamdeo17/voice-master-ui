import { Injectable } from '@angular/core';
import { HttpServiceService } from './http.service';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BotInteractionService {

  serviceUrl: string = environment.apiUrl;
  constructor(private http: HttpServiceService) { }

  sendMessge(message: string) {
    let url = this.serviceUrl + "bot/message?message=" + message;
    return this.http.getData(url);
  }
}
