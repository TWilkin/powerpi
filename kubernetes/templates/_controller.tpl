{{- define "powerpi.controller" -}}

{{- $env := .Params.Env | default list -}}

{{- if eq (empty .Values.pollFrequency) false -}}
{{- $env = append $env (dict
  "Name" "POLL_FREQUENCY"
  "Value" (.Values.pollFrequency | quote)
) -}}
{{- end -}}

{{- $env = append $env (dict
  "Name" "HEALTH_CHECK_FILE"
  "Value" "/tmp/powerpi_health"
) -}}

{{- $data := (merge
  (dict
    "UseConfig" true
    "UseDevicesFile" true
    "RequestMemory" "50Mi"
    "LimitMemory" "100Mi"
    "MqttSecret" "mosquitto-controller-secret"
    "Env" $env
    "Probe" (dict
      "Command" (list
        "/bin/sh"
        "/usr/src/app/venv/lib/python3.11/site-packages/powerpi_common/health.sh"
        "12"
        "/tmp/powerpi_health"
      )
      "ReadinessInitialDelay" 10
      "LivenessInitialDelay" 30
    )
  ) 
  .Params
) -}}

{{- include "powerpi.deployment" (merge (dict "Params" $data) . ) -}}
{{- end -}}
