{{- define "powerpi.certificate" }}
apiVersion: cert-manager.io/v1
kind: Certificate
metadata:
  name: {{ .Params.Name }}
  {{- include "powerpi.labels" . }}
spec:
  secretName: {{ .Params.Name }}
  issuerRef:
    name: {{ .Values.global.clusterIssuer }}
    kind: ClusterIssuer
  dnsNames:
  - {{ .Params.HostName }}
{{- end }}
