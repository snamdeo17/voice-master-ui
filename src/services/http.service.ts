import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { Constants } from 'src/app/common/app-constants';
import { environment } from '../environments/environment';


@Injectable({
    providedIn: 'root'
})
export class HttpServiceService {

    serviceUrl: string = environment.apiUrl;


    constructor(private http: HttpClient) { }

    getData(url: string, headers?: any, params?: any) {
        if (headers && params) {
            return this.http.get(url, { headers, params })
        } else if (headers)
            return this.http.get(url, headers);
        else
            return this.http.get(url);
    }

    postData(url: string, params: any, httpOptions) {
        return this.http.post(url, params, httpOptions);
    }

    putData(url: string, params: any, httpOptions) {
        return this.http.put(url, params, httpOptions);
    }

    deleteData(url: string, httpOptions) {
        return this.http.delete(url, httpOptions);
    }

    putReq(url: string, httpOptions) {
        return this.http.put(url, httpOptions);
    }
}
