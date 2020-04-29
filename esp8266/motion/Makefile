ARDUINO_PATH=/opt/arduino/arduino-1.8.12
SKETCH=motion.ino
TARGET_DIR=$(CURDIR)/bin
PORT?=/dev/ttyUSB0

$(TARGET_DIR)/$(SKETCH).bin: $(SKETCH)
	mkdir -p $(TARGET_DIR)
	$(ARDUINO_PATH)/arduino-builder \
		-compile \
		-hardware "$(ARDUINO_PATH)/hardware" \
    	-tools "$(ARDUINO_PATH)/tools-builder" \
    	-tools "$(ARDUINO_PATH)/hardware/tools/avr" \
		-built-in-libraries "$(ARDUINO_PATH)/libraries" \
		-fqbn=esp8266com:esp8266:generic \
		-build-path "${TARGET_DIR}" \
		$<

flash: $(TARGET_DIR)/$(SKETCH).bin
	$(ARDUINO_PATH)/hardware/esp8266com/esp8266/tools/upload.py \
		--port $(PORT) \
		write_flash \
		0x00000 \
		$<


clean:
	rm -rf ${TARGET_DIR}

all: flash
