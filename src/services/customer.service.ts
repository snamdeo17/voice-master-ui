import { Injectable } from '@angular/core';
import { HttpServiceService } from './http.service';
import { environment } from '../environments/environment';
import { HttpHeaders } from '@angular/common/http';
import { Subject } from 'rxjs';

import { Customer } from '../classes/customer.model'


@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  isRegisterOpen$ = new Subject();
  serviceUrl: string = environment.apiUrl;
  constructor(private http: HttpServiceService) { }

  register(user: Customer) {
    let url = this.serviceUrl + "api/customer";
    if (user != undefined) {
      const headers = new HttpHeaders().set("type", "" + "new");
      return this.http.postData(url, user, {headers : headers});
    }
  }

  fetchCustomers(userId: number) {
    let url = `${this.serviceUrl}/api/customervoicedata/${userId}`;
    if (userId != undefined) {
      const headers = new HttpHeaders().set("type", "" + "new");
      return this.http.getData(url, {headers : headers});
    }
  }
}
