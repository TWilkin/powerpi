const { DebuggerConfig } = require('@jovotech/plugin-debugger');

const debuggerConfig = new DebuggerConfig({
  locales: ['en'],
  buttons: [
    {
      label: 'LAUNCH',
      input: {
        type: 'LAUNCH',
      },
    },
    {
      label: 'lights on',
      input: {
        intent: 'DevicePowerIntent',
        entities: {
          deviceName: {
            id: "lights",
            value: "lights"
          },
          status: {
            id: "on",
            value: "on"
          }
        }
      },
    },
  ],
});

module.exports = debuggerConfig;
