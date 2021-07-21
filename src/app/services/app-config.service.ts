import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {IAppConfig} from '../interfaces/iapp-config';

@Injectable({
    providedIn: 'root'
})
export class AppConfigService {

    static settings: IAppConfig;

    constructor(private http: HttpClient) {
    }

    load() {

        const jsonPrefix: string = (environment.production === true ? 'prod' : 'dev');
        const jsonFile: string = `assets/config/config.${jsonPrefix}.json`;

        return new Promise<void>((resolve, reject) => {

            this.http.get(jsonFile).toPromise().then((response: IAppConfig) => {
                AppConfigService.settings = response as IAppConfig;
                resolve();
            }).catch((response: any) => {
                reject(`Could not load file '${jsonFile}': ${JSON.stringify(response)}`);
            });

        });

    }
}
