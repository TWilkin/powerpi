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
    - podSelector:
        matchLabels:
          {{- if eq (empty $element.Label) false }}
          app.kubernetes.io/name: {{ $element.Label }}
          {{- end }}
          {{- if eq (empty $element.Component) false }}
          app.kubernetes.io/component: {{ $element.Component }}
          {{- end }}

      ports:
      - protocol: {{ default "TCP" $element.Protocol }}
        port: {{ $element.Port }}
  {{- end }}
  {{- end }}
  {{- if $hasEgress }}

  egress:
  {{- range $element := .Params.Egress }}
  - to:
    {{- if eq (empty $element.Cidr) false }}
    - ipBlock:
      cidr: {{ $element.Cidr }}
      {{- if eq (empty $element.Except) false }}
      except:
      {{- range $except := $element.Except }}
      - {{ $except }}
      {{- end }}
      {{- end }}
    {{- else }}
    - podSelector:
        matchLabels:
          {{- if eq (empty $element.Label) false }}
          app.kubernetes.io/name: {{ $element.Label }}
          {{- end }}
          {{- if eq (empty $element.Component) false }}
          app.kubernetes.io/component: {{ $element.Component }}
          {{- end }}
      ports:
      - protocol: {{ default "TCP" $element.Protocol }}
        port: {{ $element.Port }}
    {{- end }}
  {{- end }}
  {{- end }}
{{- end -}}

{{- define "powerpi.mosquitto-network-policy" -}}

{{- $name := printf "%s-mosquitto" .Chart.Name -}}

{{- $messageQueue := list
  (dict
    "Label" "mosquitto"
    "Port" 1883
  )
-}}
{{- $data := dict
    "Name" $name
    "Label" .Chart.Name
    "Egress" $messageQueue
}}

{{ include "powerpi.network-policy" (merge (dict "Params" $data) .) }}

{{- end -}}


{{- define "powerpi.database-network-policy" -}}

{{- $name := printf "%s-database" .Chart.Name -}}

{{- $messageQueue := list
  (dict
    "Label" "database"
    "Port" 5432
  )
-}}
{{- $data := dict
    "Name" $name
    "Label" .Chart.Name
    "Egress" $messageQueue
}}

{{ include "powerpi.network-policy" (merge (dict "Params" $data) .) }}

{{- end -}}

{{- define "powerpi.internet-network-policy" -}}

{{- $name := printf "%s-internet" .Chart.Name -}}

{{- $messageQueue := list
  (dict
    "Cidr" "0.0.0.0/0"
    "Except" (list "10.0.0.0/8" "192.168.0.0/16" "172.16.0.0/20")
  )
-}}
{{- $data := dict
    "Name" $name
    "Label" .Chart.Name
    "Egress" $messageQueue
}}

{{ include "powerpi.network-policy" (merge (dict "Params" $data) .) }}

{{- end -}}
