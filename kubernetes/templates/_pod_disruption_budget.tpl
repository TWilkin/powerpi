{{- define "powerpi.pod-disruption-budget" }}
---
apiVersion: policy/v1
kind: PodDisruptionBudget
metadata:
  name: {{ .Params.Name | default .Chart.Name }}
  {{- include "powerpi.labels" . }}
spec:
  selector:
    matchLabels:
    {{- include "powerpi.selector" . | indent 4 }}

  maxUnavailable: 1
{{- end -}}
