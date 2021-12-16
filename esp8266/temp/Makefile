ARDUINO_PATH=/opt/arduino/arduino-1.8.12
SKETCH=temp.ino
TARGET_DIR=$(CURDIR)/bin
LIB_DIR=$(CURDIR)/lib
PORT?=/dev/ttyUSB0
ADAFRUIT_SENSOR_VERSION=1.1.4
DHT_SENSOR_VERSION=1.4.3

all: clean compile flash monitor

libraries: $(LIB_DIR)/Adafruit-Sensor-$(ADAFRUIT_SENSOR_VERSION) $(LIB_DIR)/DHT-sensor-library-$(DHT_SENSOR_VERSION)

# Download Adafruit Sensor library
$(LIB_DIR)/Adafruit-Sensor-$(ADAFRUIT_SENSOR_VERSION):
	mkdir -p $(LIB_DIR)
	wget https://github.com/adafruit/Adafruit_Sensor/archive/$(ADAFRUIT_SENSOR_VERSION).tar.gz
	tar xCfz $(LIB_DIR)/ $(ADAFRUIT_SENSOR_VERSION).tar.gz
	rm $(ADAFRUIT_SENSOR_VERSION).tar.gz

# Download DHT Sensor library
$(LIB_DIR)/DHT-sensor-library-$(DHT_SENSOR_VERSION):
	mkdir -p $(LIB_DIR)
	wget https://github.com/adafruit/DHT-sensor-library/archive/$(DHT_SENSOR_VERSION).tar.gz
	tar xCfz $(LIB_DIR)/ $(DHT_SENSOR_VERSION).tar.gz
	rm $(DHT_SENSOR_VERSION).tar.gz

$(TARGET_DIR)/$(SKETCH).bin: $(SKETCH) libraries
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
	rm -rf ${TARGET_DIR}
