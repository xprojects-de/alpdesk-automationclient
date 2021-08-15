import {Component, OnInit, OnDestroy} from '@angular/core';
import {interval, Subscription} from 'rxjs';
import {DeviceDetectorService} from 'ngx-device-detector';
import {Router} from '@angular/router';
import {RestService} from '../services/rest.service';
import {HomeautomationCategorie} from '../classes/homeautomation-categorie';
import {HomeautomationDevice} from '../classes/homeautomation-device';
import {DeviceCheckUtils} from '../classes/device-check-utils';

@Component({
    selector: 'app-devicesview',
    templateUrl: './devicesview.component.html',
    styleUrls: ['./devicesview.component.css']
})
export class DevicesviewComponent implements OnInit, OnDestroy {

    loadingarea: any = '';
    reloadIntervaltriggered: boolean = false;
    tstamp: string = '';
    STATE_NOERROR = 0;
    TYPE_OUTPUT = '2000';
    deviceviewboard: HomeautomationCategorie[] = [];
    homeautomationDevices: HomeautomationCategorie[] = [];
    private updateSubscription: Subscription;
    private touchMoveDetected: boolean = false;
    private deviceCheckUtils = new DeviceCheckUtils(this.deviceService);

    constructor(public rest: RestService, public router: Router, private deviceService: DeviceDetectorService) {
    }

    ngOnInit() {

        this.loadingarea = '<img width="100" src="assets/loading.gif" alt="loading" />';
        this.initComponent();

        this.updateSubscription = interval(5000).subscribe(counter => {
            if (counter % 24 === 0 || this.reloadIntervaltriggered === true) {
                this.reloadIntervaltriggered = false;
                this.initComponent();
            }
        });

    }

    ngOnDestroy() {

        if (this.updateSubscription) {
            this.updateSubscription.unsubscribe();
        }

    }

    initComponent() {

        this.rest.getDashboard().subscribe((data: {}) => {
            this.parseJson(data);
        });

    }

    parseJson(data: any) {

        if (data.error === this.STATE_NOERROR) {

            this.tstamp = data.tstamp;
            this.parseDevices(data.devices);

        } else {
            this.deviceviewboard = [];
        }

    }

    parseDevices(devices: any) {

        this.homeautomationDevices = [];

        devices.forEach(element => {

            const tmpDevice: HomeautomationDevice = this.getDevices(element);
            if (tmpDevice !== undefined && tmpDevice !== null) {

                let found: boolean = false;
                for (const [key, value] of Object.entries(this.homeautomationDevices)) {

                    if (value.name === element.nameCategory) {
                        found = true;
                        const homeCategorie: HomeautomationCategorie = this.homeautomationDevices[key];
                        homeCategorie.devices[homeCategorie.devices.length] = tmpDevice;
                        return;
                    }

                }

                if (!found) {

                    const homeCategorie: HomeautomationCategorie = new HomeautomationCategorie();
                    homeCategorie.name = element.nameCategory;
                    homeCategorie.devices[0] = tmpDevice;
                    homeCategorie.index = this.homeautomationDevices.length;
                    this.homeautomationDevices[this.homeautomationDevices.length] = homeCategorie;

                }

            }

        });

        this.deviceviewboard = [];
        this.loadingarea = '';
        this.deviceviewboard = this.homeautomationDevices;

    }

    getDevices(devicevalue: any): HomeautomationDevice {

        let homeDevice!: HomeautomationDevice;
        if (devicevalue.typeDevice === this.TYPE_OUTPUT) {

            homeDevice = new HomeautomationDevice();
            homeDevice.typeDevice = devicevalue.typeDevice;
            homeDevice.nameCategory = devicevalue.nameCategory;
            homeDevice.value = devicevalue.value;
            homeDevice.handleDevice = devicevalue.handleDevice;
            homeDevice.displayNameDevice = devicevalue.displayNameDevice;
            homeDevice.active = false;
            homeDevice.runningState = false;
            homeDevice.styleDevice = '';

            if (devicevalue.value !== undefined && devicevalue.value === 'true') {
                homeDevice.active = true;
            }

            if (devicevalue.runningState !== undefined && devicevalue.runningState === 'true') {
                homeDevice.runningState = true;
            }

        }

        return homeDevice;

    }

    reloadEvent(event: Event) {

        if (this.deviceCheckUtils.checkEventPerforming(event)) {

            if (event.target !== undefined) {

                if (event.type === 'touchstart') {

                    this.touchMoveDetected = false;
                    setTimeout(() => {
                        if (this.touchMoveDetected === false) {
                            this.initComponent();
                        }
                    }, 250);

                } else {
                    this.initComponent();
                }

            }

        }

    }

    touchMoveEvent(event: Event) {

        if (this.deviceCheckUtils.checkEventPerforming(event)) {
            this.touchMoveDetected = true;
        }

    }

}
