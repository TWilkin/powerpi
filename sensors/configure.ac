AC_INIT([powerpi-sensor], [0.3.0])

dnl The arguments the user can override
AC_ARG_VAR([location], [The location of this sensor])
AC_ARG_VAR([mqtt_server], [The MQTT server address])
AC_ARG_VAR([mqtt_port], [The MQTT server port])
AC_ARG_VAR([wifi_ssid], [The SSID of the WiFi connection to use])
AC_ARG_VAR([wifi_password], [The password of the WiFi connection to use])
AC_ARG_VAR([serial_baud], [The baud rate for the serial connection])

dnl The default value for any of those arguments
test "$mqtt_port" = "" && mqtt_port=1883
test "$serial_baud" = "" && serial_baud=115200

dnl Ensure the required arguments are set
m4_foreach_w(
    [var],
    [location mqtt_server wifi_ssid wifi_password],
    [
        AS_VAR_IF(var, [], AC_MSG_ERROR([Missing required variable: "var"]))
        AC_SUBST(var)
        AC_ARG_VAR(var, [])
    ]
)

dnl Identify whether to use config-server
AC_ARG_ENABLE(
    [config_server],
    [AS_HELP_STRING([--disable-config-server], [Disable getting configuration from the message queue])],
    [enable_config_server=0],
    [enable_config_server=1]
)
AC_SUBST([enable_config_server])

dnl Identify whether to use deep-sleep
AC_ARG_ENABLE(
    [deep_sleep],
    [AS_HELP_STRING([--disable-deep-sleep], [Disable support for deep-sleep])],
    [enable_deep_sleep=0],
    [enable_deep_sleep=1]
)
AC_SUBST([enable_deep_sleep])

dnl Identify whether to include the DHT22 sensor
AC_ARG_ENABLE(
    [dht22],
    [AS_HELP_STRING([--enable-dht22], [Enable DHT22 sensor support])],
    [enable_dht22=1],
    [enable_dht22=0]
)
AC_SUBST([enable_dht22])

dnl Identify whether to include the PIR sensor
AC_ARG_ENABLE(
    [pir],
    [AS_HELP_STRING([--enable-pir], [Enable PIR sensor support])],
    [enable_pir=1],
    [enable_pir=0]
)
AC_SUBST([enable_pir])

dnl Identify whether to include the button
AC_ARG_ENABLE(
    [button],
    [AS_HELP_STRING([--enable-button], [Enable button press support])],
    [enable_button=1],
    [enable_button=0]
)
AC_SUBST([enable_button])

dnl Find the arduino IDE
AC_CHECK_PROG([ARDUINO], [arduino], $(whereis arduino -b | cut -d':' -f 2), [no])
if test "$ARDUINO" == "no"
then
    AC_MSG_ERROR([Required program "arduino" not found.])
else
    ARDUINO_PATH=$(dirname "${ARDUINO}")
    AC_SUBST([ARDUINO_PATH])
fi

dnl Check for the arduino builder tool
AC_CHECK_PROG([ARDUINO_BUILDER], [arduino-builder], [yes], [no])
if test "$ARDUINO_BUILDER" == "no"
then
    AC_MSG_ERROR([Required program "arduino-builder" not found.])
else
    arduino-builder -version
fi

dnl Generate the Makefile and config.h
AC_CONFIG_FILES([Makefile src/config.h])

AC_OUTPUT