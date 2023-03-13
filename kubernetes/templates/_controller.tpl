{{- define "powerpi.controller" }}

{{- $env := .Params.Env | default list }}

{{- if eq (empty .Values.pollFrequency) false }}
{{- $env = append $env (dict
  "Name" "POLL_FREQUENCY"
  "Value" (.Values.pollFrequency | quote)
) }}
{{- end }}

{{- $data := (merge 
  (dict
    "UseConfig" true
    "UseDevicesFile" true
    "UseEventsFile" true
    "RequestMemory" "50Mi"
    "LimitMemory" "100Mi"
    "Env" $env
  ) 
  .Params
) }}

{{- include "powerpi.deployment" (merge (dict "Params" $data) . ) }}
{{- end }}
