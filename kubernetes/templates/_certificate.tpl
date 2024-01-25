{{- define "powerpi.certificate" -}}
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: {{ .Params.Name }}
  {{- include "powerpi.labels" . }}
spec:
  secretName: {{ .Params.Name }}
  issuerRef:
    name: {{ ternary "letsencrypt" .Values.global.clusterIssuer (eq .Values.global.clusterIssuer nil) }}
    kind: {{ ternary "Issuer" "ClusterIssuer" (eq .Values.global.clusterIssuer nil) }}
  dnsNames:
  - {{ .Params.HostName }}
{{- end -}}
