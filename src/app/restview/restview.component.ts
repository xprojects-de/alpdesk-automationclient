import { Component, OnInit, OnDestroy } from '@angular/core';
import { Observable, interval, Subscription } from 'rxjs';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Router } from '@angular/router';
import { RestService } from '../services/rest.service';
import { AppConfigService } from '../services/app-config.service';
import { HomeautomationCategorie } from '../classes/homeautomation-categorie';
import { HomeautomationDevice } from '../classes/homeautomation-device';
import { HomeautomationParam } from '../classes/homeautomation-param';
import { DeviceCheckUtils } from '../classes/device-check-utils';

@Component({
    selector: 'app-restview',
    templateUrl: './restview.component.html',
    styleUrls: ['./restview.component.css']
})

export class RestviewComponent implements OnInit, OnDestroy {

    loadingarea: any = '';
    reloadIntervaltriggered: boolean = false;
    tstamp: string = '';
    STATE_NOERROR = 0;
    TYPE_OUTPUT = '2000';
    TYPE_TEMPERATURE = '3000';
    TYPE_SENSOR = '7000';
    TYPE_DHT22 = '8000';
    TYPE_HEATINGPUMP = '9000';
    TYPE_VENTILATION = '10000';
    TYPE_PROPERTIEINFO_CHANGESOLLVALUE = 1;
    TYPE_PROPERTIEINFO_TOGGLEACTIVATION = 2;
    TYPE_PROPERTIEINFO_INFO = 3;
    debug = true;
    dashboard: HomeautomationCategorie[] = [];
    homeautomationDevices: HomeautomationCategorie[] = [];
    filter: any = AppConfigService.settings.devices.restfilter;

    private updateSubscription: Subscription;
    private touchMoveDetected: boolean = false;
    private deviceCheckUtils = new DeviceCheckUtils(this.deviceService);

    constructor(public rest: RestService, public router: Router, private deviceService: DeviceDetectorService) { }

    ngOnInit() {
        this.loadingarea = '<img width="100" src="assets/loading.gif" alt="loading" />';
        this.initComponent();
        this.updateSubscription = interval(5000).subscribe(counter => {
            if (counter % 12 === 0 || this.reloadIntervaltriggered === true) {
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

    sendParamMessage(device: string, param: string, value: string) {
        const message = 'p' + device + '_' + param + '@' + value;
        this.rest.modifyItem(message).subscribe((data: {}) => {
        });
        if (!this.reloadIntervaltriggered) {
            this.reloadIntervaltriggered = true;
        }
    }

    parseJson(data: any) {
        if (data.error === this.STATE_NOERROR) {
            this.tstamp = data.tstamp;
            this.parseDevices(data.devices);
        } else {
            this.dashboard = [];
        }
    }

    parseDevices(devices: any) {
        this.homeautomationDevices = [];
        let add: boolean = false;
        devices.forEach(element => {
            add = false;
            this.filter.forEach(filter => {
                if (element.idDevice === filter) {
                    add = true;
                }
            });
            if (add) {
                let found: boolean = false;
                for (const [key, value] of Object.entries(this.homeautomationDevices)) {
                    if (value.name === element.nameCategory) {
                        found = true;
                        const homeCategorie: HomeautomationCategorie = this.homeautomationDevices[key];
                        homeCategorie.devices[homeCategorie.devices.length] = this.getDevices(element);
                        return;
                    }
                }
                if (!found) {
                    const homeCategorie: HomeautomationCategorie = new HomeautomationCategorie();
                    homeCategorie.name = element.nameCategory;
                    homeCategorie.devices[0] = this.getDevices(element);
                    homeCategorie.index = this.homeautomationDevices.length;
                    this.homeautomationDevices[this.homeautomationDevices.length] = homeCategorie;
                }

            }
        });
        this.dashboard = [];
        this.loadingarea = '';
        this.dashboard = this.homeautomationDevices;
    }

    getDevices(devicevalue: any): HomeautomationDevice {
        const homeDevice: HomeautomationDevice = new HomeautomationDevice();
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
        if (!!devicevalue.params && devicevalue.params !== undefined) {
            let counter = 0;
            devicevalue.params.forEach(paramvalue => {
                const param: HomeautomationParam = new HomeautomationParam();
                param.displayName = paramvalue.displayName;
                param.handleDevice = devicevalue.handleDevice;
                param.handle = paramvalue.handle;
                param.visibleValue = paramvalue.visibleValue;
                param.value = paramvalue.value;
                param.type = paramvalue.type;
                param.editable = paramvalue.editable;
                homeDevice.params[counter] = param;
                counter++;
            });
        }
        return homeDevice;
    }

    mouseDownEvent(event: Event, dataType: number) {
        if (this.deviceCheckUtils.checkEventPerforming(event)) {
            if (event.target !== undefined) {
                switch (dataType) {
                    case 1: {
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
                        break;
                    }
                    case 2: {
                        const parentDeviceInfo: HTMLElement = (event.target as HTMLElement).parentElement;
                        let e!: HTMLElement;
                        parentDeviceInfo.childNodes.forEach(element => {
                            e = element as HTMLElement;
                            if (e.className === 'xdeviceinfocontent') {
                                e.style.top = parentDeviceInfo.offsetTop + parentDeviceInfo.offsetHeight + 'px';
                                e.style.left = parentDeviceInfo.offsetLeft + 'px';
                                e.style.width = parentDeviceInfo.offsetWidth + 'px';
                            }
                        });
                        if (event.type === 'touchstart') {
                            this.touchMoveDetected = false;
                            setTimeout(() => {
                                if (this.touchMoveDetected === false && e !== undefined) {
                                    if (e.style.display === 'none') {
                                        e.style.display = 'block';
                                    } else {
                                        e.style.display = 'none';
                                    }
                                }
                            }, 250);
                        } else {
                            if (e !== undefined) {
                                if (e.style.display === 'none') {
                                    e.style.display = 'block';
                                } else {
                                    e.style.display = 'none';
                                }
                            }
                        }
                        break;
                    }
                    default:
                        break;
                }
            }
        }
    }

    mouseUpEvent(event: Event, dataType: number) {
        if (this.deviceCheckUtils.checkEventPerforming(event)) {
            if (event.target !== undefined) {
                switch (dataType) {
                    default:
                        break;
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
