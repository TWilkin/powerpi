{{- define "powerpi.persistent-volume-claim-name" -}}
{{- $storageClassName := .Values.storageClass | default .Values.global.storageClass -}}

{{- $name := .Params.Name | default (printf "%s-volume-claim" .Chart.Name) -}}

{{- if eq (empty $storageClassName) false -}}
{{- $name = printf "%s-%s" $name $storageClassName -}}
{{- end -}}

StorageClass: {{ $storageClassName | default "powerpi-storage" }}
ClaimName: {{ $name }}
IsDefault: {{ empty $storageClassName }}

{{- end -}}


{{- define "powerpi.persistent-volume-node-selector" -}}
{{- $claim := dict
  "Name" (printf "%s-volume-claim" .Chart.Name)
-}}

{{- $claim = include "powerpi.persistent-volume-claim-name" (merge (dict "Params" $claim) .) | fromYaml }}

{{- if and .Values.global.useCluster $claim.IsDefault -}}
"powerpi-storage"
{{- end -}}

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
  storageClassName: {{ $claim.StorageClass }}
{{- end }}
