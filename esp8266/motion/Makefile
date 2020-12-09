ARDUINO_PATH=/opt/arduino/arduino-1.8.12
SKETCH=motion.ino
TARGET_DIR=$(CURDIR)/bin
LIB_DIR=$(CURDIR)/lib
PORT?=/dev/ttyUSB0
NTPCLIENT_VERSION=3.2.0
PUBSUBCLIENT_VERSION=2.7

LOCATION?=hallway

all: clean compile flash monitor

libraries: $(LIB_DIR)/NTPClient-$(NTPCLIENT_VERSION) $(LIB_DIR)/pubsubclient-$(PUBSUBCLIENT_VERSION)

# Download NTPClient library
$(LIB_DIR)/NTPClient-$(NTPCLIENT_VERSION):
	mkdir -p $(LIB_DIR)
	wget https://github.com/arduino-libraries/NTPClient/archive/$(NTPCLIENT_VERSION).tar.gz
	tar xCfz $(LIB_DIR)/ $(NTPCLIENT_VERSION).tar.gz
	rm $(NTPCLIENT_VERSION).tar.gz

# Download pubsubclient library
$(LIB_DIR)/pubsubclient-$(PUBSUBCLIENT_VERSION):
	mkdir -p $(LIB_DIR)
	wget https://github.com/knolleary/pubsubclient/archive/v$(PUBSUBCLIENT_VERSION).tar.gz
	tar xCfz $(LIB_DIR)/ v$(PUBSUBCLIENT_VERSION).tar.gz
	rm v$(PUBSUBCLIENT_VERSION).tar.gz

location.h:
	echo "#define LOCATION \"$(LOCATION)\"" > location.h

$(TARGET_DIR)/$(SKETCH).bin: $(SKETCH) location.h libraries
	mkdir -p $(TARGET_DIR)
	$(ARDUINO_PATH)/arduino-builder \
		-compile \
		-hardware "$(ARDUINO_PATH)/hardware" \
    	-tools "$(ARDUINO_PATH)/tools-builder" \
    	-tools "$(ARDUINO_PATH)/hardware/tools/avr" \
		-built-in-libraries "$(ARDUINO_PATH)/libraries" \
		-fqbn=esp8266com:esp8266:generic \
		-libraries "$(LIB_DIR)" \
		-build-path "$(TARGET_DIR)" \
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
