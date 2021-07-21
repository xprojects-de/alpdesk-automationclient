import {BrowserModule} from '@angular/platform-browser';
import {NgModule, APP_INITIALIZER} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {AppConfigService} from './services/app-config.service';
import {PlotlyViaWindowModule} from 'angular-plotly.js';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {RestviewComponent} from './restview/restview.component';
import {SocketviewComponent} from './socketview/socketview.component';
import {DevicesviewComponent} from './devicesview/devicesview.component';

export function initializeApp(appConfig: AppConfigService) {
    return () => appConfig.load();
}

@NgModule({
    declarations: [
        AppComponent,
        RestviewComponent,
        SocketviewComponent,
        DevicesviewComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        HttpClientModule,
        PlotlyViaWindowModule
    ],
    providers: [
        AppConfigService, {
            provide: APP_INITIALIZER,
            useFactory: initializeApp,
            deps: [AppConfigService], multi: true
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
