{{- define "powerpi.mosquitto-ssl" -}}
{{- $ssl := and 
  (eq .Values.global.useSSL true) 
  (eq (include "powerpi.external-mqtt" .) "true")
  (not (eq .Values.global.clusterIssuer nil)) 
  (not (eq .Values.global.mosquittoHostName nil))
-}}
{{ $ssl }}
{{- end -}}

{{/* Whether MQTT needs to be accessible from outside the cluster.
     useSensors: external sensors publish messages to MQTT.
     network: the network controller uses hostNetwork for Wake-on-LAN,
     so its MQTT traffic originates from the node IP rather than a pod IP. */}}
{{- define "powerpi.external-mqtt" -}}
{{- or (eq .Values.global.useSensors true) (eq .Values.global.network true) -}}
{{- end -}}
