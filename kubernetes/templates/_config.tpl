# templates for env of deployment
{{- define "powerpi.config.env.devices" }}
{{- if ne $.Values.global.config true }}
  - name: DEVICES_FILE
    value: /var/run/config/powerpi_config/devices.json
{{- end }}
{{- end }}

{{- define "powerpi.config.env.events" }}
{{- if ne $.Values.global.config true }}
  - name: EVENTS_FILE
    value: /var/run/config/powerpi_config/events.json
{{- end }}
{{- end }}

{{- define "powerpi.config.env.floorplan" }}
{{- if ne $.Values.global.config true }}
  - name: FLOORPLAN_FILE
    value: /var/run/config/powerpi_config/floorplan.json
{{- end }}
{{- end }}

{{- define "powerpi.config.env.schedules" }}
{{- if ne $.Values.global.config true }}
  - name: SCHEDULES_FILE
    value: /var/run/config/powerpi_config/schedules.json
{{- end }}
{{- end }}

{{- define "powerpi.config.env.users" }}
{{- if ne $.Values.global.config true }}
  - name: USERS_FILE
    value: /var/run/config/powerpi_config/users.json
{{- end }}
{{- end }}

# template for volume mounts
{{- define "powerpi.config.volumeMounts" }}
{{- if ne $.Values.global.config true }}
  - name: config
    mountPath: /var/run/config/powerpi_config
    readOnly: true
{{- end }}
{{- end }}

# template for volumes
{{- define "powerpi.config.volumes" }}
{{- if ne $.Values.global.config true }}
  - name: config
    configMap:
      name: config
{{- end }}
{{- end }}

# template for env
{{- define "powerpi.config.env" }}
{{- if eq $.Values.global.config true }}
  - name: USE_CONFIG_FILE
    value: "false"
{{- end }}
{{- if ne $.Values.global.config true }}
  - name: USE_CONFIG_FILE
    value: "true"
{{- end }}
{{- end }}

# template for env property of controller deployment
{{- define "powerpi.config.env.controller" }}
  {{- include "powerpi.config.env" . }}
  {{- include "powerpi.config.env.devices" . }}
  {{- include "powerpi.config.env.events" . }}
{{- end }}
