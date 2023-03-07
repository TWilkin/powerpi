{{- define "powerpi.controller" }}
{{- $data := (merge 
  (dict
    "UseConfig" true
    "UseDevicesFile" true
    "UseEventsFile" true
    "RequestMemory" "50Mi"
    "LimitMemory" "100Mi"
  ) 
  .Params
) }}
{{- include "powerpi.deployment" (merge (dict "Params" $data) . )}}
{{- end }}
