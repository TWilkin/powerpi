{{- define "powerpi.network-policy-part" -}}

{{- $hasNamespace := eq (empty .Params.Namespace) false -}}
{{- $hasPod := eq (and (empty .Params.Label) (empty .Params.Component) (empty .Params.K8sApp)) false -}}
{{- $hasIP := eq (empty .Params.Cidr) false -}}

{{- if $hasNamespace }}
- namespaceSelector:
    matchLabels:
      kubernetes.io/metadata.name: {{ .Params.Namespace }}
{{- end }}

{{- if $hasPod }}
{{- if $hasNamespace }}
  podSelector:
{{- else }}
- podSelector:
{{- end }}
    matchLabels:
      {{- if eq (empty .Params.Label) false }}
      app.kubernetes.io/name: {{ .Params.Label }}
      {{- end }}
      {{- if eq (empty .Params.Component) false }}
      app.kubernetes.io/component: {{ .Params.Component }}
      {{- end }}
      {{- if eq (empty .Params.K8sApp) false }}
      k8s-app: {{ .Params.K8sApp }}
      {{- end }}
{{- end }}

{{- if $hasIP }}
{{- if or $hasNamespace $hasPod }}
  ipBlock:
{{- else }}
- ipBlock:
{{- end }}
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
- protocol: {{ .Params.Protocol | default "TCP" }}
  port: {{ .Params.Port }}
{{- end }}

{{- end -}}

{{- define "powerpi.network-policy" -}}
{{- if .Values.global.useNetworkPolicies -}}

{{- $database := and .Params.Database .Values.global.persistence -}}

{{- $ingress := .Params.Ingress | default list -}}
{{- $egress := .Params.Egress | default list -}}

{{- if or .Params.DNS .Params.Mosquitto .Params.ExternalMqtt $database .Params.External -}}
{{- $egress = append $egress (dict
    "Namespace" "kube-system"
    "K8sApp" "kube-dns"
    "Protocol" "UDP"
    "Port" 53
) -}}
{{- end -}}

{{- if and .Params.Mosquitto (not .Params.ExternalMqtt) -}}
{{- $egress = append $egress (dict
    "Label" "mosquitto"
    "Port" 1883
) -}}
{{- end -}}

{{- if .Params.ExternalMqtt -}}
{{- $egress = append $egress (dict
    "Label" "mosquitto"
    "Port" 8883
) -}}
{{- end -}}

{{- if $database -}}
{{- $egress = append $egress (dict
    "Label" "database"
    "Port" 5432
) -}}
{{- end -}}

{{- if .Params.IngressController -}}
{{- $ingress = append $ingress (dict
    "Namespace" "ingress"
    "Port" .Params.IngressController
) -}}
{{- end -}}

{{- if .Params.Kubernetes -}}
{{- $egress = append $egress (dict
    "Cidr" .Values.global.kubernetesClusterCIDR
    "Port" (.Values.global.kubernetesAPIPort | default "16443")
) -}}
{{- end -}}

{{- if .Params.External -}}
{{- $egress = append $egress (dict
    "Cidr" "0.0.0.0/0"
    "Except" (list "10.0.0.0/8" "192.168.0.0/16" "172.16.0.0/20")
    "Port" 443
) -}}
{{- end -}}

{{- if eq (empty .Params.Local) false -}}
{{- $local := list -}}
{{- $port := .Params.Local.Port -}}
{{- $protocol := .Params.Local.Protocol -}}
{{- range $cidr := .Params.Local.Cidr }}
{{- $local = append $local (dict
  "Cidr" $cidr
  "Port" $port
  "Protocol" $protocol
) -}}
{{- end -}}

{{- if eq .Params.Local.Direction "ingress" -}}
{{- $ingress = concat $ingress $local -}}
{{- end -}}
{{- if eq .Params.Local.Direction "egress" -}}
{{- $egress = concat $egress $local -}}
{{- end -}}
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
{{- end -}}
