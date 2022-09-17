#!/bin/sh

# start bluetooth
bluetoothctl power on
bluetoothctl scan on & > /dev/null


# start the controller
python -m bluetooth_controller

# wait and exit on the processes
wait -n
exit $?
