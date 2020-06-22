import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { WebsocketService } from '../services/websocket.service';
import { Subject, interval, Subscription } from 'rxjs';
import { AppConfigService } from '../services/app-config.service';
import { HomeautomationCategorie } from '../classes/homeautomation-categorie';
import { HomeautomationDevice } from '../classes/homeautomation-device';
import { HomeautomationParam } from '../classes/homeautomation-param';
import { HomeautomationRecord } from '../classes/homeautomation-record';
import { DeviceCheckUtils } from '../classes/device-check-utils';
import { AsyncStatusMessage } from '../classes/async-status-message';

@Component({
    selector: 'app-socketview',
    templateUrl: './socketview.component.html',
    styleUrls: ['./socketview.component.css']
})
export class SocketviewComponent implements OnInit, OnDestroy {

    @ViewChild('socketContainer') socketContainer!: ElementRef;
    @ViewChild('cycletimeSelector') cycletimeSelector!: ElementRef;

    private endpoint = AppConfigService.settings.apiServer.websocket;
    private websocketService: WebsocketService;

    loadingarea: any = '';
    output: any = [];
    categoriehtml: HomeautomationCategorie = null;
    STATE_ERROR: number = 1;
    STATE_NOERROR: number = 0;
    STATE_INFO: number = 0;
    STATE_STATUS: number = 1;
    STATE_SET: number = 2;
    STATE_INIT: number = 3;
    STATE_MULTISET: number = 4;
    TYPE_INPUT: string = '1000';
    TYPE_OUTPUT: string = '2000';
    TYPE_TEMPERATURE: string = '3000';
    TYPE_SCENE: string = '4000';
    TYPE_TIME: string = '5000';
    TYPE_DIMMERDEVICE: string = '6000';
    TYPE_SENSOR: string = '7000';
    TYPE_DHT22: string = '8000';
    TYPE_HEATINGPUMP: string = '9000';
    TYPE_VENTILATION: string = '10000';
    TYPE_SHADING: string = '11000';
    TYPE_CYCLETIME: string = '-10';
    TYPE_PROPERTIEINFO_DEFAULT: number = 0;
    TYPE_PROPERTIEINFO_CHANGESOLLVALUE: number = 1;
    TYPE_PROPERTIEINFO_TOGGLEACTIVATION: number = 2;
    TYPE_PROPERTIEINFO_INFO: number = 3;
    idleProperty: boolean = false;

    homeautomationDevices: HomeautomationCategorie[] = [];

    private touchMoveDetected: boolean = false;
    private touchEnd: boolean = false;
    private touchStart: boolean = false;
    private touchDateStart: number = 0;
    private deviceCheckUtils = new DeviceCheckUtils(this.deviceService);
    private asyncStatusSubject: Subject<AsyncStatusMessage> = new Subject<AsyncStatusMessage>();
    private asyncStatusSubjectFlag: Boolean = false;
    private updateSubscription: Subscription;

    constructor(websocketService: WebsocketService, private deviceService: DeviceDetectorService) {
        this.loadingarea = '<img width="150" src="assets/loading.gif" alt="loading" />';
        this.websocketService = websocketService;
    }

    ngOnInit() {
        this.websocketService.connect(this.endpoint).then(res => {
            this.websocketService.subscribeInit().subscribe(message => {
                this.parseMessage(message);
            });
            this.websocketService.sendInitRequest();
            this.websocketService.subscribeTopic().subscribe(message => {
                if (this.asyncStatusSubject !== null && this.asyncStatusSubject !== undefined) {
                    this.asyncStatusSubject.next(message as AsyncStatusMessage);
                }
            });
            this.updateSubscription = interval(5000).subscribe(counter => {
                this.websocketService.sendWatchdogRequest();
            });
        });

    }

    ngOnDestroy() {
        this.updateSubscription.unsubscribe();
        this.asyncStatusSubject.unsubscribe();
        this.websocketService.disconnect();
    }

    renderDeviceCategorieHTML(index: number) {
        const categorie: HomeautomationCategorie = this.homeautomationDevices[index];
        categorie.devices.forEach(devicevalue => {
            if (devicevalue.typeDevice === this.TYPE_INPUT) {
                devicevalue.classvalue = 'xinputdevice';
                devicevalue.show = true;
            } else if (devicevalue.typeDevice === this.TYPE_OUTPUT) {
                devicevalue.classvalue = 'xoutdevice';
                devicevalue.show = true;
            } else if (devicevalue.typeDevice === this.TYPE_TEMPERATURE) {
                devicevalue.classvalue = 'xpt1000device';
                devicevalue.show = true;
            } else if (devicevalue.typeDevice === this.TYPE_SCENE) {
                devicevalue.classvalue = 'xscenedevice';
                devicevalue.show = true;
            } else if (devicevalue.typeDevice === this.TYPE_TIME) {
                devicevalue.classvalue = 'xtimedevice';
                devicevalue.show = true;
            } else if (devicevalue.typeDevice === this.TYPE_DIMMERDEVICE) {
                devicevalue.classvalue = 'xdimmerdevice';
                devicevalue.show = true;
            } else if (devicevalue.typeDevice === this.TYPE_SENSOR) {
                devicevalue.classvalue = 'xsensor';
                devicevalue.show = true;
            } else if (devicevalue.typeDevice === this.TYPE_DHT22) {
                devicevalue.classvalue = 'xdht22';
                devicevalue.show = true;
            } else if (devicevalue.typeDevice === this.TYPE_HEATINGPUMP) {
                devicevalue.classvalue = 'xheating';
                devicevalue.show = true;
            } else if (devicevalue.typeDevice === this.TYPE_VENTILATION) {
                devicevalue.classvalue = 'xventilation';
                devicevalue.show = true;
            } else if (devicevalue.typeDevice === this.TYPE_SHADING) {
                devicevalue.classvalue = 'xshading';
                devicevalue.show = true;
            }
            if (devicevalue.records.length > 0) {
                devicevalue.showrecordGraph = true;
                const dimension: number = parseInt(devicevalue.records[0].dimension, 10);
                let k: number = 0;
                for (k = 0; k < dimension; k++) {
                    devicevalue.recordGraph.data.push({
                        x: [],
                        y: [],
                        type: 'scatter',
                        mode: 'lines+points',
                        marker: { color: devicevalue.colors[k] }
                    });
                }
                devicevalue.recordGraph.layout.title = devicevalue.nameCategory + ' ' + devicevalue.displayNameDevice;
                devicevalue.records.forEach(record => {
                    if (record.values.length === dimension) {
                        for (k = 0; k < dimension; k++) {
                            devicevalue.recordGraph.data[k].x.push(record.legend);
                            devicevalue.recordGraph.data[k].y.push(record.values[k]);
                        }
                    }
                });
            }
        });
        this.categoriehtml = categorie;
        if (this.asyncStatusSubjectFlag === false) {
            this.asyncStatusSubject.subscribe(message => {
                this.parseMessage(message);
            });
            this.asyncStatusSubjectFlag = true;
        }
    }

    private parseMessage(message: any) {
        if (message.error === this.STATE_NOERROR) {
            if (message.kind === this.STATE_INIT) {
                this.parseDevices(message.devices);
            } else {
                const msg = message as AsyncStatusMessage;
                if (msg.kind === this.STATE_SET) {
                    this.parseSetMessage(msg);
                } else if (msg.kind === this.STATE_MULTISET) {
                    if (msg.asm.length > 0) {
                        msg.asm.forEach((element: AsyncStatusMessage) => {
                            if (element.kind === this.STATE_SET) {
                                this.parseSetMessage(element);
                            }
                        });
                    }
                }
            }
        }
    }

    parseSetMessage(message: AsyncStatusMessage): void {
        if (message.id === this.TYPE_CYCLETIME) {
            const info = message.value.split('|');
            if (this.cycletimeSelector !== undefined) {
                const ct: HTMLElement = this.cycletimeSelector.nativeElement as HTMLElement;
                ct.innerHTML = 'CycleTime: ' + info[0] + 'ms<small> (' + info[1] + 'ms / ' + info[2] + 'ms)</small>';
                if (this.idleProperty === false) {
                    this.idleProperty = true;
                    ct.style.backgroundColor = '#f0f0f0';
                } else {
                    this.idleProperty = false;
                    ct.style.backgroundColor = '#87DB92';
                }
            }
        } else {
            if (this.socketContainer !== undefined) {
                const st: HTMLElement = this.socketContainer.nativeElement as HTMLElement;
                const qs = st.querySelector('[id=\'' + message.id + '\']');
                if (qs !== null) {
                    if (message.id.substring(0, 1) === 'p') {
                        const pinfo = message.value.split('|');
                        if (pinfo.length === 2) {
                            qs.setAttribute('class', pinfo[1] + ' xdeviceinfoparamvalue');
                        } else {
                            qs.setAttribute('class', 'xdeviceinfoparamvalue');
                        }
                        qs.innerHTML = pinfo[0];
                    } else if (message.id.substring(0, 1) === 'd') {
                        const dinfo = message.value.split('|');
                        if (dinfo.length === 2) {
                            qs.setAttribute('class', dinfo[1] + ' xdeviceinfoparamvalue');
                        } else {
                            qs.setAttribute('class', 'xdeviceinfoparamvalue');
                        }
                        qs.innerHTML = dinfo[0];
                        qs.setAttribute('data-value', dinfo[0]);
                    } else {
                        if (message.value === '1') {
                            qs.classList.add('xactive');
                        } else {
                            qs.classList.remove('xactive');
                        }
                    }
                }
            }
        }
    }

    sendParamMessage(device: string, param: string, value: string) {
        const message = '!p' + device + '_' + param + '#' + value;
        this.messageTransaction(message);
    }

    private parseDevices(devices: any) {
        devices.forEach(element => {
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
        });
        this.loadingarea = '';
        this.output = this.homeautomationDevices;
    }

    private getDevices(devicevalue: any): HomeautomationDevice {
        const homeDevice: HomeautomationDevice = new HomeautomationDevice();
        homeDevice.typeDevice = devicevalue.typeDevice;
        homeDevice.nameCategory = devicevalue.nameCategory;
        homeDevice.value = devicevalue.value;
        homeDevice.handleDevice = devicevalue.handleDevice;
        homeDevice.displayNameDevice = devicevalue.displayNameDevice;
        homeDevice.active = false;
        homeDevice.runningState = false;
        homeDevice.styleDevice = devicevalue.styleDevice;
        if (devicevalue.value !== undefined && devicevalue.value === 'true') {
            homeDevice.active = true;
        }
        if (devicevalue.value !== undefined && devicevalue.runningState === 'true') {
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
        if (!!devicevalue.dashboard && devicevalue.dashboard !== undefined) {
            let counter = 0;
            devicevalue.dashboard.forEach(dashboardvalue => {
                const dashboard: HomeautomationParam = new HomeautomationParam();
                dashboard.displayName = dashboardvalue.displayName;
                dashboard.handleDevice = devicevalue.handleDevice;
                dashboard.handle = dashboardvalue.handle;
                dashboard.visibleValue = dashboardvalue.visibleValue;
                dashboard.value = dashboardvalue.value;
                dashboard.type = dashboardvalue.type;
                dashboard.editable = dashboardvalue.editable;
                homeDevice.dashboard[counter] = dashboard;
                counter++;
            });
        }
        if (!!devicevalue.records && devicevalue.records !== undefined) {
            let counter = 0;
            devicevalue.records.forEach(recordvalue => {
                const record: HomeautomationRecord = new HomeautomationRecord();
                record.id = recordvalue.id;
                record.dimension = recordvalue.dimension;
                record.legend = recordvalue.legend;
                record.values = recordvalue.values.split('|');
                record.date = recordvalue.date;
                homeDevice.records[counter] = record;
                counter++;
            });
        }

        return homeDevice;
    }

    messageTransaction(message: string) {
        this.websocketService.sendMessageRequest(message);
    }

    async delay(ms: number) {
        await new Promise(resolve => setTimeout(() => resolve(), ms)).then(() => console.log('fired'));
    }

    mouseDownEvent(event: Event, dataType: number, typeDevice: any) {
        if (this.deviceCheckUtils.checkEventPerforming(event)) {
            if (event.target !== undefined) {
                const eventTarget: HTMLElement = event.target as HTMLElement;
                switch (dataType) {
                    case 1: {
                        if (typeDevice === this.TYPE_INPUT) {
                            if (event.type === 'touchstart') {
                                this.touchDateStart = new Date().getMilliseconds();
                                this.touchStart = false;
                                this.touchEnd = false;
                                this.touchMoveDetected = false;
                                setTimeout(() => {
                                    if (this.touchMoveDetected === false && this.touchEnd === false) {
                                        this.messageTransaction('!' + eventTarget.getAttribute('id') + '#1');
                                        this.touchStart = true;
                                    }
                                }, 250);
                            } else {
                                this.messageTransaction('!' + eventTarget.getAttribute('id') + '#1');
                            }
                        } else if (typeDevice === this.TYPE_SCENE) {
                            if (event.type === 'touchstart') {
                                this.touchMoveDetected = false;
                                setTimeout(() => {
                                    if (this.touchMoveDetected === false) {
                                        this.messageTransaction('!scene#' + eventTarget.getAttribute('id'));
                                    }
                                }, 250);
                            } else {
                                this.messageTransaction('!scene#' + eventTarget.getAttribute('id'));
                            }
                        }
                        break;
                    }
                    case 2: {
                        const parentDeviceInfo: HTMLElement = eventTarget.parentElement;
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
                                if (this.touchMoveDetected === false) {
                                    if (e.style.display === 'none') {
                                        e.style.display = 'block';
                                    } else {
                                        e.style.display = 'none';
                                    }
                                }
                            }, 250);
                        } else {
                            if (e.style.display === 'none') {
                                e.style.display = 'block';
                            } else {
                                e.style.display = 'none';
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


    mouseUpEvent(event: Event, dataType: number, typeDevice: any) {
        if (this.deviceCheckUtils.checkEventPerforming(event)) {
            if (event.target !== undefined) {
                const eventTarget: HTMLElement = event.target as HTMLElement;
                switch (dataType) {
                    case 1: {
                        if (typeDevice === this.TYPE_INPUT) {
                            if (event.type === 'touchend') {
                                this.touchEnd = true;
                                if (this.touchStart === true) {
                                    this.messageTransaction('!' + eventTarget.getAttribute('id') + '#0');
                                } else if (this.touchMoveDetected === false) {
                                    this.messageTransaction('!' + eventTarget.getAttribute('id') + '#1');
                                    setTimeout(() => {
                                        this.messageTransaction('!' + eventTarget.getAttribute('id') + '#0');
                                    }, (new Date().getMilliseconds() - this.touchDateStart));
                                }
                                this.touchStart = false;
                            } else {
                                this.messageTransaction('!' + eventTarget.getAttribute('id') + '#0');
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

    touchMoveEvent(event: Event) {
        if (this.deviceCheckUtils.checkEventPerforming(event)) {
            this.touchMoveDetected = true;
        }
    }

}
