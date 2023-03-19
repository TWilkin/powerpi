{{- define "powerpi.selector" }}
  app.kubernetes.io/name: {{ .Chart.Name }}
  app.kubernetes.io/component: {{ .Values.component }}
  app.kubernetes.io/part-of: powerpi
  app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "powerpi.labels.no-version" }}
  labels:
    {{- include "powerpi.selector" . | indent 2 }}
{{- end }}


{{- define "powerpi.labels" }}
  {{- include "powerpi.labels.no-version" . }}
    app.kubernetes.io/version: {{ .Chart.AppVersion }}
    helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
{{- end }}
