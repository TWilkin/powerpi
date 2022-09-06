AC_INIT([powerpi-sensor], [0.2.3])

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

dnl Identify whether to use clacks-config
AC_ARG_ENABLE(
    [clacks],
    [AS_HELP_STRING([--disable-clacks], [Disable getting configuration from the message queue])],
    [enable_clacks=0],
    [enable_clacks=1]
)
AC_SUBST([enable_clacks])

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
