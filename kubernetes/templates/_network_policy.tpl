{{- define "powerpi.network-policy" -}}

{{- $hasIngress := eq (empty .Params.Ingress) false  -}}
{{- $hasEgress := eq (empty .Params.Egress) false  -}}

apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: {{ .Params.Name }}
  {{- include "powerpi.labels" . }}
spec:
  podSelector:
    matchLabels:
      app.kubernetes.io/component: {{ .Params.Component }}

  policyTypes:
  {{- if $hasIngress }}
  - Ingress
  {{- end }}
  {{- if $hasEgress }}
  - Egress
  {{- end }}
  {{- if $hasIngress }}

  ingress:
  {{- range $element := .Params.Ingress }}
  - from:
    - podSelector:
        matchLabels:
          app.kubernetes.io/component: {{ $element.Component }}
      ports:
      - protocol: {{ default "TCP" $element.Protocol }}
        port: {{ $element.Port }}
  {{- end }}
  {{- end }}
  {{- if $hasEgress }}

  egress:
  {{- range $element := .Params.Egress }}
  - to:
    - podSelector:
        matchLabels:
          app.kubernetes.io/component: {{ $element.Component }}
      ports:
      - protocol: {{ default "TCP" $element.Protocol }}
        port: {{ $element.Port }}
  {{- end }}
  {{- end }}
{{- end -}}

{{- define "powerpi.mosquitto-network-policy" -}}

{{- $name := printf "%s-mosquitto" .Chart.Name -}}

{{- $messageQueue := list
  (dict
    "Component" "message-queue"
    "Port" 1883
  )
-}}
{{- $data := dict
    "Name" $name
    "Component" .Chart.Name
    "Egress" $messageQueue
}}

{{ include "powerpi.network-policy" (merge (dict "Params" $data) .) }}

{{- end -}}
