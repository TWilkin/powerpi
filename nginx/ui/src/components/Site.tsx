import React from 'react';
import { BrowserRouter, Link, Route, Switch } from 'react-router-dom';

export default class Site extends React.Component {
    render() {
        return (
            <BrowserRouter>
                <div id='menu'>
                    <nav>
                        <ul>
                            <li><Link to='/devices'>Devices</Link></li>
                        </ul>
                    </nav>
                    <hr />
                </div>

                <div id='content'>
                    <Switch>
                        <Route path='/devices'>
                            <h1>Devices</h1>
                        </Route>

                        <Route path='/'>
                            <h1>PowerPi</h1>
                        </Route>
                    </Switch>
                </div>
            </BrowserRouter>
        );
    }
};
