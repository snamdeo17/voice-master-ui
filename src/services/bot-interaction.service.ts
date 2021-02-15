import { Injectable } from '@angular/core';
import { HttpServiceService } from './http.service';
import { environment } from '../environments/environment';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class BotInteractionService {

  serviceUrl: string = environment.apiUrl;
  constructor(private http: HttpServiceService) { }

  sendMessge(message: string, userId: string) {
    const transaction = 'transaction';
    const history = 'history';
    
    let url = this.serviceUrl + "bot/message?message=" + message;
    if(message.includes(transaction) && message.includes(history) ){
      url = this.serviceUrl + "bot/message/transactionhistory?message=" + message;
    }
    if(message.includes('show') && message.includes('my') && message.includes('bills')){
      url = this.serviceUrl + "bot/message/pendingbill?message=" + message;
    }
    if (userId != undefined) {
      const headers = new HttpHeaders()
        .set('userId', '' + userId);
      return this.http.getData(url, { 'headers': headers });
    } else {
      return this.http.getData(url);
    }

  }
}
