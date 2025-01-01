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
      {{- if eq (empty .Params.Label) false }}
      app.kubernetes.io/name: {{ .Params.Label }}
      {{- end }}
      {{- if eq (empty .Params.Component) false }}
      app.kubernetes.io/component: {{ .Params.Component }}
      {{- end }}

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
    {{- include "powerpi.network-policy-part" (dict "Params" $element) | indent 4 }}
  {{- end }}
  {{- end }}
  {{- if $hasEgress }}

  egress:
  {{- range $element := .Params.Egress }}
  - to:
    {{- include "powerpi.network-policy-part" (dict "Params" $element) | indent 4 }}
  {{- end }}
  {{- end }}
{{- end -}}

{{- define "powerpi.mosquitto-network-policy" -}}

{{- $name := printf "%s-mosquitto-egress" .Chart.Name -}}

{{- $data := dict
    "Name" $name
    "Label" .Chart.Name
    "Mosquitto" true
}}

{{ include "powerpi.network-policy2" (merge (dict "Params" $data) .) }}

{{- end -}}


{{- define "powerpi.database-network-policy" -}}

{{- $name := printf "%s-database-egress" .Chart.Name -}}

{{- $data := dict
    "Name" $name
    "Label" .Chart.Name
    "Database" true
}}

{{ include "powerpi.network-policy2" (merge (dict "Params" $data) .) }}

{{- end -}}

{{- define "powerpi.internet-network-policy" -}}

{{- $name := printf "%s-internet-egress" .Chart.Name -}}

{{- $data := dict
    "Name" $name
    "Label" .Chart.Name
    "External" true
}}

{{ include "powerpi.network-policy2" (merge (dict "Params" $data) .) }}

{{- end -}}

{{- define "powerpi.local-network-policy" -}}

{{- $name := printf "%s-local-egress" .Chart.Name -}}

{{- $data := dict
    "Name" $name
    "Label" .Chart.Name
    "Local" "egress"
}}

{{ include "powerpi.network-policy2" (merge (dict "Params" $data) .) }}

{{- end -}}

{{- define "powerpi.ingress-network-policy" -}}

{{- $name := printf "%s-ingress" .Chart.Name -}}

{{- $data := dict
    "Name" $name
    "Label" .Chart.Name
    "IngressController" true
}}

{{ include "powerpi.network-policy2" (merge (dict "Params" $data) .) }}

{{- end -}}
