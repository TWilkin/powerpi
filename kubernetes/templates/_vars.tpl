{{- define "powerpi.mosquitto-ssl" -}}
{{- $ssl := and 
  (eq .Values.global.useSSL true) 
  (eq .Values.global.useSensors true) 
  (not (eq .Values.global.clusterIssuer nil)) 
  (not (eq .Values.global.mosquittoHostName nil))
-}}
{{ $ssl }}
{{- end -}}
