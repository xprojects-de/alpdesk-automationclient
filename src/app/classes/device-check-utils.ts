import { DeviceDetectorService } from 'ngx-device-detector';

export class DeviceCheckUtils {

    constructor(private deviceService: DeviceDetectorService) { }

    public checkEventPerforming(event: Event): boolean {
        let value: boolean = false;
        if (this.deviceService.isDesktop()) {
            if (event.type === 'mousedown' || event.type === 'mouseup') {
                event.preventDefault();
                value = true;
            }
        } else if (this.deviceService.isMobile() || this.deviceService.isTablet()) {
            if (event.type === 'touchstart' || event.type === 'touchend' || event.type === 'touchmove') {
                value = true;
            }
        }
        return value;
    }

}
