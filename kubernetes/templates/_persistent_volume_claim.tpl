{{- define "powerpi.persistent-volume-claim-name" -}}
{{- $storageClassName := .Values.storageClass | default .Values.global.storageClass -}}

{{- $name := .Params.Name | default (printf "%s-volume-claim" .Chart.Name) -}}

{{- if eq (empty $storageClassName) false -}}
{{- $name = printf "%s-%s" $name $storageClassName -}}
{{- end -}}

StorageClass: {{ $storageClassName }}
ClaimName: {{ $name }}

{{- end -}}

{{- define "powerpi.persistent-volume-claim" -}}

{{- $claim := include "powerpi.persistent-volume-claim-name" . | fromYaml -}}

apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: {{ $claim.ClaimName }}
  {{- include "powerpi.labels" . }}
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: {{ .Params.Size }} 
  storageClassName: {{ $claim.StorageClass | default "powerpi-storage" }}
{{- end }}
