{{- define "powerpi.cron-job" }}

{{- $name := .Params.Name | default .Chart.Name }}

{{- $data := (merge
  (dict
    "Name" $name
    "RestartPolicy" "Never"
  )
  .Params
) }}

apiVersion: batch/v1
kind: CronJob
metadata:
  name: {{ $name }}
  {{- include "powerpi.labels" . }}

spec:
  schedule: {{ .Params.Schedule | quote }}
  concurrencyPolicy: Replace

  jobTemplate:
    spec:
      {{- include "powerpi.template" (merge (dict "Params" $data) . ) | indent 6 }}

{{- end }}
