import React from "react";
import ReactTooltip from "react-tooltip";

const Home = () => (
    <div id="home">
        <svg viewBox="0 0 600 300" preserveAspectRatio="true">
            <g>
                <title>Home</title>
                <rect id="LivingRoom" width="300" height="300" data-tip data-for="LivingRoom" />
                <rect id="Kitchen" x="300" width="300" height="300" data-tip data-for="Kitchen" />
            </g>
        </svg>

        <ReactTooltip id="LivingRoom">
            <h3>Living Room</h3>
            <p>temperature: 300C</p>
            <p>humidity: 98%</p>
        </ReactTooltip>
    </div>
);
export default Home;
