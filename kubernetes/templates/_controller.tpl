{{- define "powerpi.controller" }}
{{- $data := (merge 
  (dict
    "UseConfig" true
    "UseDevicesFile" true
    "UseEventsFile" true
    "RequestMemory" "50Mi"
    "LimitMemory" "100Mi"
    "Env" (concat
      (list 
        (dict 
          "Name" "POLL_FREQUENCY" 
          "Value" (.Values.pollFrequency | default 120 | quote)
        )
      )
      (.Params.Env | default list)
    )
  ) 
  .Params
) }}
{{- include "powerpi.deployment" (merge (dict "Params" $data) . )}}
{{- end }}
