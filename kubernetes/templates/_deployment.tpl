{{- define "powerpi.deployment" }}
{{- $name := .Params.Name | default .Chart.Name }}
{{- $config := and .Params.UseConfig (not .Values.global.config) }}
{{- $hasVolumeClaim := eq (empty .Params.PersistentVolumeClaim) false }}
{{- $hasVolumeClaimEnv := and $hasVolumeClaim (eq (empty .Params.PersistentVolumeClaim.EnvName) false) }}
{{- $hasConfig := eq (empty .Params.Config) false }}
apiVersion: apps/v1
kind: {{ .Params.Kind | default "Deployment" }}
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
      {{- if eq (empty .Params.NodeSelector) false }}
      nodeSelector:
      {{- range $element := .Params.NodeSelector }}
        {{ $element.Name }}: {{ $element.Value }}
      {{- end }}
      {{- end }}

      {{- if eq (empty .Params.PriorityClassName) false }}
      priorityClassName: {{ .Params.PriorityClassName }}
      {{- end }}

      containers:
      - name: {{ $name }}
        image: {{ .Values.image | default .Params.Image | default (printf "twilkin/powerpi-%s" $name) }}:{{ .Values.imageTag | default .Chart.AppVersion }}

        {{- if eq (empty .Params.Ports) false }}
        ports:
        {{- range $element := .Params.Ports }}
        - name: {{ $element.Name }}
          containerPort: {{ $element.Port }}
        {{- end }}
        {{- end }}

        {{- if or (eq (empty .Params.Env) false) (eq .Params.UseConfig true) $hasVolumeClaimEnv }}
        env:
        {{- if $hasVolumeClaimEnv }}
        - name: {{ .Params.PersistentVolumeClaim.EnvName }}
          value: {{ .Params.PersistentVolumeClaim.EnvValue }}
        {{- end }}
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

        {{- if or (eq (empty .Params.VolumeMounts) false) (eq $config true) (eq $hasVolumeClaim true) (eq $hasConfig true) }}
        volumeMounts:
        {{- if eq $hasVolumeClaim true }}
        - name: {{ .Params.PersistentVolumeClaim.Name }}
          mountPath: {{ .Params.PersistentVolumeClaim.Path }}
        {{- end }}

        {{- if eq $hasConfig true }}
        {{- range $element := .Params.Config }}
        - name: {{ $element.Name }}
          mountPath: {{ $element.Path }}
          {{- if eq (empty $element.SubPath) false }}
          subPath: {{ $element.SubPath }}
          {{- end }}
          readOnly: true
        {{- end }}
        {{- end }}

        {{- include "powerpi.config.volumeMounts" . | indent 6 }}
        {{- end }}

      {{- if or (eq (empty .Params.Volumes) false) (eq $config true) (eq $hasVolumeClaim true) (eq $hasConfig true) }}
      volumes:
      {{- if eq $hasVolumeClaim true }}
      - name: {{ .Params.PersistentVolumeClaim.Name }}
        persistentVolumeClaim:
          claimName: {{ .Params.PersistentVolumeClaim.Claim }}
      {{- end }}

      {{- if eq $hasConfig true }}
      {{- range $element := .Params.Config }}
      - name: {{ $element.Name }}
        configMap:
          name: {{ $element.Name }}
      {{- end }}
      {{- end }}

      {{- include "powerpi.config.volumes" . | indent 4 }}
      {{- end }}
{{- end }}
