{{- define "powerpi.deployment" }}
{{- $name := .Params.Name | default .Chart.Name }}
{{- $config := and .Params.UseConfig (not .Values.global.config) }}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ $name }}
  {{- include "powerpi.labels" . }}
spec:
  selector:
    matchLabels:
    {{- include "powerpi.selector" . | indent 4 }}
  template:
    metadata:
    {{- include "powerpi.labels" . | indent 4 }}
    spec:
      containers:
      - name: {{ $name }}
        image: {{ .Params.Image | default (printf "twilkin/powerpi-%s" $name) }}:{{ .Chart.AppVersion }}
        {{- if eq (empty .Params.Ports) false }}
        ports:
        {{- range $element := .Params.Ports }}
        - name: {{ $element.Name }}
          containerPort: {{ $element.Port }}
        {{- end }}
        {{- end }}
        {{- if or (eq (empty .Params.Env) false) (eq .Params.UseConfig true) }}
        env:
        {{- if eq .Params.UseConfig true }}
        {{- include "powerpi.config.env" . | indent 6 }}
        {{- end }}
        {{- if eq .Params.UseDevicesFile true }}
        {{- include "powerpi.config.env.devices" . | indent 6 }}
        {{- end }}
        {{- if eq .Params.UseEventsFile true }}
        {{- include "powerpi.config.env.events" . | indent 6 }}
        {{- end }}
        {{- range $element := .Params.Env }}
        - name: {{ $element.Name }}
          value: {{ $element.Value }}
        {{- end }}
        {{- end }}
        resources:
          requests:
            cpu: {{ .Params.RequestCPU | default "50m" }}
            memory: {{ .Params.RequestMemory | default "100Mi" }}
            {{- range $element := .Params.Resources }}
            {{ $element.Name }}: {{ $element.Value }}
            {{- end }}
          limits:
            cpu: {{ .Params.LimitCPU | default 1 }}
            memory: {{ .Params.LimitMemory | default "200Mi" }}
            {{- range $element := .Params.Resources }}
            {{ $element.Name }}: {{ $element.Value }}
            {{- end }}
        {{- if or (eq (empty .Params.VolumeMounts) false) (eq $config true) }}
        volumeMounts:
        {{- include "powerpi.config.volumeMounts" . | indent 6 }}
        {{- end }}
      {{- if or (eq (empty .Params.Volumes) false) (eq $config true) }}
      volumes:
      {{- include "powerpi.config.volumes" . | indent 4 }}
      {{- end }}
{{- end }}
