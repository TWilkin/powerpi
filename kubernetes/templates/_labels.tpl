{{- define "powerpi.selector.no-version" }}
  app.kubernetes.io/name: {{ .Chart.Name }}
  app.kubernetes.io/component: {{ .Values.component }}
  app.kubernetes.io/part-of: powerpi
  app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{- define "powerpi.selector" }}
  {{- include "powerpi.selector.no-version" . }}
  app.kubernetes.io/version: {{ .Chart.AppVersion }}
  helm.sh/chart: {{ .Chart.Name }}-{{ .Chart.Version | replace "+" "_" }}
{{- end }}

{{- define "powerpi.labels" }}
  labels:
    {{- include "powerpi.selector" . | indent 2 }}
{{- end }}

{{- define "powerpi.labels.no-version" }}
  labels:
    {{- include "powerpi.selector.no-version" . | indent 2 }}
{{- end }}
