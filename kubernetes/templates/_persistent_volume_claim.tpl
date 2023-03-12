{{- define "powerpi.persistent-volume-claim" }}
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: {{ .Params.Name | default (printf "%s-volume-claim" .Chart.Name) }}
  {{- include "powerpi.labels" . }}
spec:
  accessModes:
  - ReadWriteOnce
  resources:
    requests:
      storage: {{ .Params.Size }} 
  storageClassName: {{ .Values.storageClass | default "powerpi-storage" }}
{{- end }}
