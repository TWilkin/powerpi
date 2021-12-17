AC_INIT([powerpi-sensor], [0.1.0])

dnl The arguments the user can override
AC_ARG_VAR([location], [The location of this sensor])
AC_ARG_VAR([mqtt_server], [The MQTT server address])
AC_ARG_VAR([mqtt_port], [The MQTT server port])
AC_ARG_VAR([wifi_ssid], [The SSID of the WiFi connection to use])
AC_ARG_VAR([wifi_password], [The password of the WiFi connection to use])
AC_ARG_VAR([include_dht22], [Whether to build including the DHT22 sensor code or not])
AC_ARG_VAR([include_pir], [Whether to build including the PIR sensor code or not])

dnl The default value for any of those arguments
test "$mqtt_port" = "" && mqtt_port=1883
test "$include_dht22" = "" && include_dht22=0
test "$include_pir" = "" && include_pir=0

dnl Ensure the required arguments are set
m4_foreach_w([var],[location mqtt_server wifi_ssid wifi_password],[
    AS_VAR_IF(var, [], AC_MSG_ERROR([Missing required variable: "var"]))
    AC_SUBST(var)
    AC_ARG_VAR(var, [])
])

dnl Generate the Makefile and config.h
AC_CONFIG_FILES([Makefile src/config.h])

AC_OUTPUT
