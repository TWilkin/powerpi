{{- define "powerpi.persistent-volume-claim" -}}

{{- $storageClassName := .Values.storageClass | default .Values.global.storageClass -}}

{{- $name := .Params.Name | default (printf "%s-volume-claim" .Chart.Name) -}}

{{- if eq (empty $storageClassName) false -}}
{{- $name = printf "%s-%s" $name $storageClassName -}}
{{- end -}}

apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: {{ $name }}
  {{- include "powerpi.labels" . }}
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: {{ .Params.Size }} 
  storageClassName: {{ $storageClassName | default "powerpi-storage" }}
{{- end }}
