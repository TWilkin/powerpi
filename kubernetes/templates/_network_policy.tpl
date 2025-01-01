{{- define "powerpi.network-policy-part" -}}

{{- if eq (empty .Params.Namespace) false }}
- namespaceSelector:
    matchLabels:
      kubernetes.io/metadata.name: {{ .Params.Namespace }}
{{- end }}

{{- if eq (and (empty .Params.Label) (empty .Params.Component)) false }}
- podSelector:
    matchLabels:
      {{- if eq (empty .Params.Label) false }}
      app.kubernetes.io/name: {{ .Params.Label }}
      {{- end }}
      {{- if eq (empty .Params.Component) false }}
      app.kubernetes.io/component: {{ .Params.Component }}
      {{- end }}
{{- end }}

{{- if eq (empty .Params.Cidr) false }}
- ipBlock:
    cidr: {{ .Params.Cidr }}

    {{- if eq (empty .Params.Except) false }}
    except:
    {{- range $except := .Params.Except }}
    - {{ $except }}
    {{- end }}
    {{- end }}
{{- end }}

{{- if eq (empty .Params.Port) false }}
ports:
- protocol: {{ default "TCP" .Params.Protocol }}
  port: {{ .Params.Port }}
{{- end }}

{{- end -}}

{{- define "powerpi.network-policy" -}}

{{- $ingress := .Params.Ingress | default list -}}
{{- $egress := .Params.Egress | default list -}}

{{- if .Params.Mosquitto -}}
{{- $egress = append $egress (dict
    "Label" "mosquitto"
    "Port" 1883
) -}}
{{- end -}}

{{- if and .Params.Database .Values.global.persistence -}}
{{- $egress = append $egress (dict
    "Label" "database"
    "Port" 5432
) -}}
{{- end -}}

{{- if .Params.IngressController -}}
{{- $ingress = append $ingress (dict
    "Namespace" "ingress"
) -}}
{{- end -}}

{{- $hasIngress := eq (empty $ingress) false  -}}
{{- $hasEgress := eq (empty $egress) false  -}}

{{- if .Params.External -}}
{{- $egress = append $egress (dict
    "Cidr" "0.0.0.0/0"
    "Except" (list "10.0.0.0/8" "192.168.0.0/16" "172.16.0.0/20")
) -}}
{{- end -}}

{{- $local := list
  (dict
    "Cidr" "10.0.0.0/8"
  )
  (dict
    "Cidr" "192.168.0.0/16"
  )
  (dict
    "Cidr" "172.16.0.0/20"
  )
-}}

{{- if eq .Params.Local "ingress" -}}
{{- $ingress = concat $ingress $local -}}
{{- end -}}
{{- if eq .Params.Local "egress" -}}
{{- $egress = concat $egress $local -}}
{{- end -}}

{{- $hasIngress := eq (empty $ingress) false  -}}
{{- $hasEgress := eq (empty $egress) false  -}}

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
  {{- range $element := $ingress }}
  - from:
    {{- include "powerpi.network-policy-part" (dict "Params" $element) | indent 4 }}
  {{- end }}
  {{- end }}
  {{- if $hasEgress }}

  egress:
  {{- range $element := $egress }}
  - to:
    {{- include "powerpi.network-policy-part" (dict "Params" $element) | indent 4 }}
  {{- end }}
  {{- end }}

{{- end -}}
