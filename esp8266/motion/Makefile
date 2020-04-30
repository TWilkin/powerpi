ARDUINO_PATH=/opt/arduino/arduino-1.8.12
SKETCH=motion.ino
TARGET_DIR=$(CURDIR)/bin
PORT?=/dev/ttyUSB0
PUBSUBCLIENT_VERSION=2.7

LOCATION?=hallway

all: clean compile flash monitor

# Download pubsubclient library
pubsubclient-$(PUBSUBCLIENT_VERSION):
	wget https://github.com/knolleary/pubsubclient/archive/v$(PUBSUBCLIENT_VERSION).tar.gz
	tar xfz v$(PUBSUBCLIENT_VERSION).tar.gz
	rm v$(PUBSUBCLIENT_VERSION).tar.gz

location.h:
	echo "const char* LOCATION = \"$(LOCATION)\";" > location.h

$(TARGET_DIR)/$(SKETCH).bin: $(SKETCH) location.h pubsubclient-$(PUBSUBCLIENT_VERSION)
	mkdir -p $(TARGET_DIR)
	$(ARDUINO_PATH)/arduino-builder \
		-compile \
		-hardware "$(ARDUINO_PATH)/hardware" \
    	-tools "$(ARDUINO_PATH)/tools-builder" \
    	-tools "$(ARDUINO_PATH)/hardware/tools/avr" \
		-built-in-libraries "$(ARDUINO_PATH)/libraries" \
		-fqbn=esp8266com:esp8266:generic \
		-libraries "$(CURDIR)/pubsubclient-$(PUBSUBCLIENT_VERSION)" \
		-build-path "${TARGET_DIR}" \
		$<

compile: $(TARGET_DIR)/$(SKETCH).bin

flash: $(TARGET_DIR)/$(SKETCH).bin
	$(ARDUINO_PATH)/hardware/esp8266com/esp8266/tools/upload.py \
		--port $(PORT) \
		write_flash \
		0x00000 \
		$<

monitor:
	screen $(PORT) 115200

clean:
	rm location.h
	rm -rf ${TARGET_DIR}
