import { faHourglassHalf, faLayerGroup, faLightbulb, faLock, faPlug, faPowerOff, faQuestion, faTv } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
                    <div key={device.name} className='device' 
                            title={`Device ${device.name} is currently ${device.state}.`}>
                        <div className='device-icon'>
                            <FontAwesomeIcon icon={this.deviceIcon(device)} />
                        </div>
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
        let classes = buttonFor === 'on' ? 'power-on' : 'power-off';
        if(device.state === buttonFor) {
            classes += ' active'
        }

        return (
            <button className={classes} onClick={() => this.props.api.postMessage(device, buttonFor)}>
                <FontAwesomeIcon icon={faPowerOff} />
            </button>
        );
    }

    deviceIcon(device: Device) {
        switch(device.type) {
            case 'composite':
                return faLayerGroup;

            case 'delay':
                return faHourglassHalf;
            
            case 'harmony_activity':
            case 'harmony_hub':
                return faTv;

            case 'light':
                return faLightbulb;
            
            case 'mutex':
                return faLock;
            
            case 'socket':
            case 'socket_group':
                return faPlug;
            
            default:
                return faQuestion;
        }
    }

};
