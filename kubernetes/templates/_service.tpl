{{- define "powerpi.service" }}

{{- $type := .Params.Type | default "ClusterIP" -}}

apiVersion: v1
kind: Service
metadata:
  name: {{ .Params.Name | default .Chart.Name }}
  {{- include "powerpi.labels" . }}
spec:
  selector:
  {{- include "powerpi.selector" (merge (dict "Params" (dict "Name" .Chart.Name)) .) | indent 2 }}
  type: {{ $type }}
  ports:
  - name: {{ .Params.PortName | default "http" }}
    protocol: TCP
    port: {{ .Params.Port | default 80 }}
    targetPort: {{ .Params.PortName | default "http" }}
  {{- if and (eq $type "LoadBalancer") (not (empty .Params.LoadBalancerIP)) }}
  loadBalancerIP: {{ .Params.LoadBalancerIP }}
  {{- end }}
{{- end }}
