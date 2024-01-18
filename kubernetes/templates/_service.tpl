{{- define "powerpi.service" }}
apiVersion: v1
kind: Service
metadata:
  name: {{ .Params.Name | default .Chart.Name }}
  {{- include "powerpi.labels" . }}
spec:
  selector:
  {{- include "powerpi.selector" . | indent 2 }}
  type: {{ .Params.Type | default "ClusterIP" }}
  ports:
  {{- if eq (empty .Params.Ports) true }}
  - name: {{ .Params.PortName | default "http" }}
    protocol: TCP
    port: {{ .Params.Port | default 80 }}
    targetPort: {{ .Params.PortName | default "http" }}
  {{- else -}}
  {{- range $port := .Params.Ports }}
  - name: {{ $port.Name }}
    protocol: TCP
    port: {{ $port.Port  }}
    targetPort: {{ $port.Name }}
  {{- end -}}
  {{- end -}}
{{- end }}
