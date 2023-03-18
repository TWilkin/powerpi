{{- define "powerpi.selector" }}
  app.kubernetes.io/name: {{ .Chart.Name }}
  app.kubernetes.io/version: {{ .Chart.AppVersion }}
  app.kubernetes.io/component: {{ .Values.component }}
  app.kubernetes.io/part-of: powerpi
  app.kubernetes.io/managed-by: {{ .Release.Service }}
  helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
{{- end }}

{{- define "powerpi.labels" }}
  labels:
    {{- include "powerpi.selector" . | indent 2 }}
{{- end }}
