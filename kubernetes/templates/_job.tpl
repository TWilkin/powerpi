{{- define "powerpi.job" }}

{{- $name := .Params.Name | default .Chart.Name }}

{{- $data := (merge
  (dict
    "Name" $name
  )
  .Params
) }}

apiVersion: batch/v1
kind: {{ .Params.Kind | default "CronJob" }}
metadata:
  name: {{ $name }}
  {{- include "powerpi.labels" . }}

spec:
  {{- if ne (empty .Params.Schedule) false }}
  schedule: {{ .Params.Schedule }}
  {{- end }}

  jobTemplate:
    spec:
      {{- include "powerpi.template" (merge (dict "Params" $data) . ) | indent 6 }}
          restartPolicy: Never

{{- end }}
