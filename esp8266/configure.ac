AC_INIT([powerpi], [0.0.1])

dnl The arguments the user can override
AC_ARG_VAR([location], [The location of this sensor])
AC_ARG_VAR([mqtt_server], [The MQTT server address])
AC_ARG_VAR([mqtt_port], [The MQTT server port])
AC_ARG_VAR([wifi_ssid], [The SSID of the WiFi connection to use])
AC_ARG_VAR([wifi_password], [The password of the WiFi connection to use])

dnl The default value for any of those arguments
${mqtt_port:=1883}

dnl Ensure the required arguments are set
m4_foreach_w([var],[location mqtt_server wifi_ssid wifi_password],[
    AS_VAR_IF(var, [], AC_MSG_ERROR([Missing required variable: "var"]))
    AC_SUBST(var)
    AC_ARG_VAR(var, [])
])

dnl Generate the Makefile and config.h
AC_CONFIG_FILES([Makefile src/config.h])

AC_OUTPUT
