import {Injectable} from '@angular/core';
import {Observable} from 'rxjs';
import * as StompJS from '@stomp/stompjs';
import {AsyncStatusMessage} from '../classes/async-status-message';

@Injectable({
    providedIn: 'root'
})
export class WebsocketService {

    topic: string = '/reply/';
    private stompClient!: StompJS.Client;
    connId: string = '';

    constructor() {
    }

    private setConnectionId(connId: string): void {
        this.connId = connId;
    }

    getConnectionId(): string {
        return this.connId;
    }

    async connect(url: string): Promise<any> {

        return new Promise((resolve, reject) => {

            this.stompClient = new StompJS.Client({
                brokerURL: url,
                // debug: (str: string) => {
                //   console.log(str);
                // }
            });

            this.stompClient.onConnect = () => {

                this.stompClient.subscribe('/reply/connect', message => {
                    if (this.getConnectionId() === '') {
                        const body = JSON.parse(message.body);
                        this.setConnectionId(body.connectionId);
                        resolve(message);
                    } else {
                        reject();
                    }
                });

                this.sendMessage('/connect', {clientId: 'connectRequest'});

            };

            this.stompClient.activate();

        });

    }

    disconnect() {

        if (this.stompClient !== null && this.stompClient !== undefined) {

            this.sendMessage('/disconnect/' + this.getConnectionId(), '');

            this.stompClient.unsubscribe('/reply/connect');
            this.stompClient.unsubscribe(this.topic + 'init/' + this.getConnectionId());
            this.stompClient.unsubscribe(this.topic + this.getConnectionId());
            this.stompClient.deactivate().then();

            this.setConnectionId('');

        }

    }

    private sendMessage(dest: string, body: any): void {

        if (this.stompClient !== null && this.stompClient !== undefined && this.stompClient.active) {
            this.stompClient.publish({destination: dest, body: JSON.stringify(body)});
        }

    }

    subscribeTopic(): Observable<AsyncStatusMessage> {

        return new Observable<AsyncStatusMessage>(observer => {
            this.stompClient.subscribe(this.topic + this.getConnectionId(), (message) => observer.next(JSON.parse(message.body)));
        });

    }

    subscribeInit(): Observable<any> {

        return new Observable(observer => {
            this.stompClient.subscribe(this.topic + 'init/' + this.getConnectionId(), (message) => observer.next(JSON.parse(message.body)));
        });

    }

    sendInitRequest() {
        this.sendMessage('/init/' + this.getConnectionId(), '');
    }

    sendWatchdogRequest() {
        this.sendMessage('/watchdog/' + this.getConnectionId(), '');
    }

    sendMessageRequest(message: any) {
        this.sendMessage('/message/' + this.getConnectionId(), {message});
    }

}
