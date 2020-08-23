import React from 'react';

import Api from '../api';

interface DeviceListProps {
    api: Api;
}

interface DeviceListModel {
    devices: any[];
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
            <ul>
                {this.state.devices.map(device => {
                    <li key={device.name}>
                        {device.name}
                    </li>
                })}
            </ul>
        );
    }
};
