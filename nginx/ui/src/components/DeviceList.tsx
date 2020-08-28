import moment from 'moment';
import React from 'react';
import Moment from 'react-moment';

import { Api, Device, DeviceState } from '../api';

interface DeviceListProps {
    api: Api;
}

interface DeviceListModel {
    devices: Device[];
}

export default class DeviceList extends React.Component<DeviceListProps, DeviceListModel> {

    constructor(props: DeviceListProps) {
        super(props);

        this.state = {
            devices: []
        };
    }

    async componentDidMount() {
        this.setState({
            devices: await this.props.api.getDevices()
        });

        const localThis = this;
        this.props.api.connectSocket({
            onMessage(message: { device: string, state: DeviceState, timestamp: number }) {
                let index = localThis.state.devices.findIndex(device => device.name === message.device);
        
                if(index) {
                    let devices = [...localThis.state.devices];
                    let device = devices[index];
                    device.state = message.state;
                    device.since = message.timestamp;
                    devices[index] = device;
        
                    localThis.setState({
                        devices: devices
                    });
                }
            }
        });
    }

    render() {
        return (
            <div id='device-list'>
                {this.state.devices.map(device => 
                    <div key={device.name} className='device'>
                        <div className='device-name'>{device.name}</div>
                        <div className='device-state'>
                            {this.renderButton(device, 'on')}
                            {this.renderButton(device, 'off')}
                        </div>
                        <div className='device-since'>
                            {device.since && device.since > -1 ? (
                                <span title={moment(device.since).format('L LT')}>
                                    <Moment date={device.since} fromNow />
                                </span>
                            ) : (
                                <></>
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }

    renderButton(device: Device, buttonFor: DeviceState) {
        const isActive = device.state === buttonFor;
        const classes = `device-${buttonFor}-button ${isActive ? 'active' : ''}`;

        return (
            <button className={classes} onClick={() => this.props.api.postMessage(device, buttonFor)}>
                {buttonFor}
            </button>
        );
    }

};
