SKETCH = motion.ino
TARGET_DIR = $(CURDIR)/bin

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
		./$(SKETCH)

clean:
	rm -rf ${TARGET_DIR}

all: $(TARGET_DIR)/$(SKETCH).bin
