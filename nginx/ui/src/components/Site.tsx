import React from 'react';
import { BrowserRouter, NavLink, Route, Switch } from 'react-router-dom';

import { Api } from '../api';
import DeviceList from './DeviceList';

const api = new Api();

export default class Site extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <div id='menu'>
                    <nav>
                        {this.renderMenuLink('/', 'Home')}
                        {this.renderMenuLink('/devices', 'Devices')}
                    </nav>
                </div>
                <br />

                <div id='content'>
                    <Switch>
                        <Route path='/devices'>
                            <DeviceList api={api} />
                        </Route>

                        <Route path='/'>
                            <h1>PowerPi</h1>
                        </Route>
                    </Switch>
                </div>
            </BrowserRouter>
        );
    }

    renderMenuLink(path: string, name: string) {
        return (
            <NavLink activeClassName='active' exact to={path}>
                <div className='menu-element'>{name}</div>
            </NavLink>
        )
    }
};
