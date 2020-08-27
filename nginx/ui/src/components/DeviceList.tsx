import moment from 'moment';
import React from 'react';
import Moment from 'react-moment';

import { Api, Device } from '../api';

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
    }

    render() {
        return (
            <div id='device-list'>
                {this.state.devices.map(device => 
                    <div key={device.name} className='device'>
                        <div className='device-name'>{device.name}</div>
                        <div className='device-state'>{device.state}</div>
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
};
