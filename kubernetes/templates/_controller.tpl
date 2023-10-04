{{- define "powerpi.controller" -}}

{{- $env := .Params.Env | default list -}}

{{- if eq (empty .Values.pollFrequency) false -}}
{{- $env = append $env (dict
  "Name" "POLL_FREQUENCY"
  "Value" (.Values.pollFrequency | quote)
) -}}
{{- end -}}

{{- $data := (merge 
  (dict
    "UseConfig" true
    "UseDevicesFile" true
    "UseEventsFile" true
    "RequestMemory" "50Mi"
    "LimitMemory" "100Mi"
    "MqttSecret" "mosquitto-controller-secret"
    "Env" $env
    "Probe" (dict
      "Command" (list
        "/bin/sh"
        "/usr/src/app/venv/lib/python3.11/site-packages/powerpi_common/health.sh"
      )
      "ReadinessInitialDelay" 10
      "LivenessInitialDelay" 30
    )
  ) 
  .Params
) -}}

{{- include "powerpi.deployment" (merge (dict "Params" $data) . ) -}}
{{- end -}}
