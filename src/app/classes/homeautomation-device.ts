
import {HomeautomationParam} from '../classes/homeautomation-param';
import {HomeautomationRecord} from '../classes/homeautomation-record';

export class HomeautomationDevice {

    typeDevice: any;
    nameCategory: any;
    value: any;
    handleDevice: any;
    displayNameDevice: any;
    active: boolean;
    runningState: boolean;
    styleDevice: string;
    classvalue: string;
    show: boolean = false;
    params: HomeautomationParam[] = [];
    dashboard: HomeautomationParam[] = [];
    records: HomeautomationRecord[] = [];
    recordGraph = {
        data: [],
        layout: {width: 800, height: 600, title: ''}
    };
    showrecordGraph: boolean = false;
    colors: any = ['green', 'blue', 'red', 'yellow', 'pink'];

}
