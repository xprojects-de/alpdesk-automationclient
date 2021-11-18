import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {AppConfigService} from './app-config.service';

@Injectable({
    providedIn: 'root'
})
export class RestService {

    endpoint = AppConfigService.settings.apiServer.rest;
    httpOptions: any = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };

    constructor(private http: HttpClient) {

    }

    private extractData(res: Response) {

        const body = res;
        return body || {};

    }

    getDashboard(): Observable<any> {
        // @ts-ignore
        return this.http.get(this.endpoint + 'dashboardv2').pipe(map(this.extractData));
    }

    modifyItem(value: string): Observable<any> {

        const sysJson = JSON.stringify({value});
        const options = {
            headers: new HttpHeaders().append('Content-Type', 'application/json')
        };

        // @ts-ignore
        return this.http.post(this.endpoint + 'setv2', sysJson, options).pipe(map(this.extractData));

    }
}
