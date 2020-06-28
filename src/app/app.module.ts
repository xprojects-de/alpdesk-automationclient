import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, Injector } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppConfigService } from './services/app-config.service';
import { PlotlyViaWindowModule } from 'angular-plotly.js';
import { DeviceDetectorModule } from 'ngx-device-detector';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { RestviewComponent } from './restview/restview.component';
import { SocketviewComponent } from './socketview/socketview.component';
import { DevicesviewComponent } from './devicesview/devicesview.component';
import { createCustomElement } from '@angular/elements';

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
        DeviceDetectorModule.forRoot(),
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

    constructor(private injector: Injector) { }

    ngDoBootstrap() {
        const baseElement = createCustomElement(AppComponent, { injector: this.injector });
        customElements.define('app-automationroot', baseElement);
        const restElement = createCustomElement(RestviewComponent, { injector: this.injector });
        customElements.define('app-restview', restElement);
        const socketElement = createCustomElement(SocketviewComponent, { injector: this.injector });
        customElements.define('app-socketview', socketElement);
        const deviceElement = createCustomElement(DevicesviewComponent, { injector: this.injector });
        customElements.define('app-devicesview', deviceElement);
    }
}
