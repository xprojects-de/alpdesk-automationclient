import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppConfigService } from './services/app-config.service';
import * as PlotlyJS from 'plotly.js';
import { PlotlyModule } from 'angular-plotly.js';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RestviewComponent } from './restview/restview.component';
import { SocketviewComponent } from './socketview/socketview.component';
import { DevicesviewComponent } from './devicesview/devicesview.component';

PlotlyModule.plotlyjs = PlotlyJS;

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
        PlotlyModule,
        DeviceDetectorModule.forRoot()
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
export class AppModule { }
