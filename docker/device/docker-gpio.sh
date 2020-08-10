#!/bin/sh

# find the id of /dev/gpiomem
id=`ls -lah /dev/gpiomem | awk '{print $5}' | sed s/[^0-9]*//g`

# watch for changes to the docker device directory
watch_directory=/sys/fs/cgroup/devices
inotifywait --monitor --recursive --event create $watch_directory | while read dir op file
do
    echo "Detected directory $file"

    # check if file has a devices.allow
    devices_allow=$watch_directory/docker/$file/devices.allow
    if [ -f "$devices_allow" ]
    then
	for i in `seq 5`
	do
	        # allow this container to access GPIO
		echo "Allowing container $file to access GPIO"
        	echo "c $id:0 rwm" | tee -a $devices_allow
		sleep 1
	done
    fi
done

