{{- define "powerpi.deployment" }}

{{- $name := .Params.Name | default .Chart.Name }}

{{- $data := (merge
  (dict
    "Name" $name
  )
  .Params
) }}

apiVersion: apps/v1
kind: {{ .Params.Kind | default "Deployment" }}
metadata:
  name: {{ $name }}
  {{- include "powerpi.labels" . }}
    {{- if eq (empty .Params.Role) false }}
    role: {{ .Params.Role }}
    {{- end }}

spec:
  selector:
    matchLabels:
    {{- include "powerpi.selector" . | indent 4 }}
  
  {{- include "powerpi.template" (merge (dict "Params" $data) . ) | indent 2 }}

{{- end }}
