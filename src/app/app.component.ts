import { Component } from '@angular/core';
import { AppConfigService } from './services/app-config.service';

@Component({
    selector: 'app-automationroot',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    title = 'Alpdesk-Automationclient';
    version = AppConfigService.settings.version;

}
