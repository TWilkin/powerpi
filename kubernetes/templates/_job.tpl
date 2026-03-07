{{- define "powerpi.job" }}

{{- $name := .Params.Name | default .Chart.Name }}

{{- $data := (merge
  (dict
    "Name" $name
    "RestartPolicy" "Never"
  )
  .Params
) }}

apiVersion: batch/v1
kind: {{ ternary "Job" "CronJob" (empty .Params.Schedule) }}
metadata:
  name: {{ $name }}
  {{- include "powerpi.labels" . }}
  {{- if .Params.Hook }}
  annotations:
    helm.sh/hook: {{ .Params.Hook }}
    helm.sh/hook-delete-policy: before-hook-creation
  {{- end }}

spec:
  {{- if not (empty .Params.Schedule) }}
  schedule: {{ .Params.Schedule | quote }}
  concurrencyPolicy: {{ .Params.ConcurrencyPolicy | default "Replace" }}
  {{- end }}

  {{ ternary "template" "jobTemplate" (empty .Params.Schedule) }}:
    spec:
      activeDeadlineSeconds: {{ .Params.ActiveDeadlineSeconds }}
      
      {{- include "powerpi.template" (merge (dict "Params" $data) . ) | indent 6 }}

{{- end }}
