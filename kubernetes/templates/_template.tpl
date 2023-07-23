{{- define "powerpi.template" }}

{{- $secrets := ternary .Params.Secret list (eq (empty .Params.Secret) false) -}}
{{- if eq (empty .Params.MqttSecret) false -}}
{{- $secrets = append $secrets (dict
  "Name" .Params.MqttSecret
  "Env" (list
    (dict
      "Name" "MQTT_USER"
      "Key" "username"
    )
    (dict
      "Name" "MQTT_SECRET_FILE"
      "SubPath" "password"
    )
  )
) -}}
{{- end -}}

{{- $name := .Params.Name | default .Chart.Name }}
{{- $config := and .Params.UseConfig (not .Values.global.config) }}
{{- $hasVolumeClaim := eq (empty .Params.PersistentVolumeClaim) false }}
{{- $hasVolumeClaimEnv := and $hasVolumeClaim (eq (empty .Params.PersistentVolumeClaim.EnvName) false) }}
{{- $hasConfig := eq (empty .Params.Config) false }}
{{- $hasSecret := eq (empty $secrets) false }}
{{- $hasAnnotations := eq (empty .Params.Annotations) false }}

template:
  metadata:
  {{- include "powerpi.labels.no-version" . | indent 2 }}

    {{- if or $hasAnnotations $config $hasConfig }}
    annotations:
      {{- if $hasAnnotations }}
      {{- range $element := .Params.Annotations }}
      {{ $element.Name }}: {{ $element.Value | quote }}
      {{- end }}
      {{- end }}

      {{- if $hasConfig }}
      {{- range $element := .Params.Config }}
      checksum/{{ $element.Name }}: {{ include (print $.Template.BasePath "/config-map.yaml") $ | sha256sum }}
      {{- end }}
      {{- end }}

      {{- if $config }}
      # this isn't ideal as it'll always restart but helm can't access that config-map template from the parent
      checksum/config: {{ randAlphaNum 5 | quote }}
      {{- end }}
    {{- end }}

  spec:
    {{- if eq (empty .Params.NodeSelector) false }}
    nodeSelector:
    {{- range $element := .Params.NodeSelector }}
      {{ $element.Name }}: {{ $element.Value | quote }}
    {{- end }}
    {{- end }}

    {{- if and .Values.global.useCluster (gt (.Params.Replicas | default 1) 1) }}
    affinity:
      podAntiAffinity:
        requiredDuringSchedulingIgnoredDuringExecution:
        - labelSelector:
            matchExpressions:
            - key: app.kubernetes.io/name
              operator: In
              values:
              - {{ .Chart.Name }}
          topologyKey: kubenertes.io/hostname
    {{- end -}}

    {{- if eq (empty .Params.PriorityClassName) false }}
    priorityClassName: {{ .Params.PriorityClassName }}
    {{- end }}

    {{- if .Params.HostNetwork }}
    hostname: {{ $name }}
    hostNetwork: true
    dnsPolicy: ClusterFirstWithHostNet
    {{- end }}

    containers:
    - name: {{ $name }}

      image: {{ .Values.image | default .Params.Image | default (printf "twilkin/powerpi-%s" $name) }}:{{ .Values.imageTag | default .Params.ImageTag | default .Chart.AppVersion }}
      {{- if and (empty .Values.image) (empty .Values.imageTag) }}
      imagePullPolicy: IfNotPresent
      {{- else }}
      # if we're using another image the tag may change
      imagePullPolicy: Always
      {{- end }}

      {{- if eq (empty .Params.Command) false }}
      command:
      {{- range $element := .Params.Command }}
      - {{ $element | quote }}
      {{- end }}
      {{- end }}

      {{- if eq (empty .Params.Args) false }}
      args:
      {{- range $element := .Params.Args }}
      - {{ $element | quote }}
      {{- end }}
      {{- end }}

      {{- if eq (empty .Params.Ports) false }}
      ports:
      {{- range $element := .Params.Ports }}
      - name: {{ $element.Name }}
        containerPort: {{ $element.Port }}
      {{- end }}
      {{- end }}

      {{- if or (eq (empty .Params.Env) false) .Params.UseConfig $hasVolumeClaimEnv $hasSecret }}
      env:
      {{- if $hasVolumeClaimEnv }}
      - name: {{ .Params.PersistentVolumeClaim.EnvName }}
        value: {{ .Params.PersistentVolumeClaim.EnvValue | default .Params.PersistentVolumeClaim.Path }}
      {{- end }}

      {{- if $hasSecret }}
      {{- range $element := $secrets }}
      {{- if eq (empty $element.Env) false }}
      {{- range $env := $element.Env }}
      - name: {{ $env.Name }}
        {{- if eq (empty $env.Key) false }}
        valueFrom:
          secretKeyRef:
            name: {{ $element.Name }}
            key: {{ $env.Key }}
        {{- else }}
        value: {{ $env.Value | default (printf "/var/run/secrets/%s/%s" $element.Name $env.SubPath) }}
        {{- end }}
      {{- end }}
      {{- end }}
      {{- end }}
      {{- end }}

      {{- if $config }}
      {{- if eq .Params.UseConfig true }}
      - name: USE_CONFIG_FILE
        value: "true"
      {{- end }}
      {{- if .Params.UseDevicesFile }}
      - name: DEVICES_FILE
        value: /var/run/config/powerpi_config/devices.json
      {{- end }}
      {{- if .Params.UseEventsFile }}
      - name: EVENTS_FILE
        value: /var/run/config/powerpi_config/events.json
      {{- end }}
      {{- if .Params.UseFloorplanFile }}
      - name: FLOORPLAN_FILE
        value: /var/run/config/powerpi_config/floorplan.json
      {{- end }}
      {{- if .Params.UseSchedulesFile }}
      - name: SCHEDULES_FILE
        value: /var/run/config/powerpi_config/schedules.json
      {{- end }}
      {{- if .Params.UseUsersFile }}
      - name: USERS_FILE
        value: /var/run/config/powerpi_config/users.json
      {{- end }}
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

      {{- if eq (empty .Params.Probe) false }}
      readinessProbe:
        {{- if eq (empty .Params.Probe.Http) false }}
        httpGet:
          path: {{ .Params.Probe.Http }}
          port: {{ (first .Params.Ports).Name }}
        {{- end }}
        {{- if .Params.Probe.Tcp }}
        tcpSocket:
          port: {{ (first .Params.Ports).Name }}
        {{- end }}
        {{- if .Params.Probe.Command }}
        exec:
          command:
          {{- range $element := .Params.Probe.Command }}
          - {{ $element }}
          {{- end }}
        {{- end }}
        initialDelaySeconds: {{ .Params.Probe.ReadinessInitialDelay }}
      
      livenessProbe:
        {{- if eq (empty .Params.Probe.Http) false }}
        httpGet:
          path: {{ .Params.Probe.Http }}
          port: {{ (first .Params.Ports).Name }}
        {{- end }}
        {{- if .Params.Probe.Tcp }}
        tcpSocket:
          port: {{ (first .Params.Ports).Name }}
        {{- end }}
        {{- if .Params.Probe.Command }}
        exec:
          command:
          {{- range $element := .Params.Probe.Command }}
          - {{ $element }}
          {{- end }}
        {{- end }}
        initialDelaySeconds: {{ .Params.Probe.LivenessInitialDelay }}
      {{- end }}

      {{- if or (eq (empty .Params.Volumes) false) $config $hasVolumeClaim $hasConfig $hasSecret }}
      volumeMounts:
      {{- range $element := .Params.Volumes }}
      - name: {{ $element.Name }}
        mountPath: {{ $element.MountPath | default $element.Path }}
      {{- end }}

      {{- if $hasVolumeClaim }}
      - name: {{ .Params.PersistentVolumeClaim.Name }}
        mountPath: {{ .Params.PersistentVolumeClaim.Path }}
      {{- end }}

      {{- if $hasConfig }}
      {{- range $element := .Params.Config }}
      - name: {{ $element.Name }}
        mountPath: {{ $element.Path }}
        {{- if eq (empty $element.SubPath) false }}
        subPath: {{ $element.SubPath }}
        {{- end }}
        readOnly: true
      {{- end }}
      {{- end }}

      {{- if $hasSecret }}
      {{- range $element := $secrets }}
      - name: {{ $element.Name }}
        mountPath: {{ printf "/var/run/secrets/%s" $element.Name }}
        readOnly: true
      {{- end }}
      {{- end }}

      {{- if $config }}
      - name: config
        mountPath: /var/run/config/powerpi_config
        readOnly: true
      {{- end }}

      {{- end }}

    restartPolicy: {{ .Params.RestartPolicy | default "Always" }}

    {{- if or (eq (empty .Params.Volumes) false) $config $hasVolumeClaim $hasConfig $hasSecret }}
    volumes:
    {{- range $element := .Params.Volumes }}
    - name: {{ $element.Name }}
      hostPath:
        path: {{ $element.HostPath | default $element.Path }}
    {{- end }}

    {{- if $hasVolumeClaim }}
    - name: {{ .Params.PersistentVolumeClaim.Name }}
      persistentVolumeClaim:
        claimName: {{ .Params.PersistentVolumeClaim.Claim | default (printf "%s-volume-claim" .Chart.Name) }}
    {{- end }}

    {{- if $hasConfig }}
    {{- range $element := .Params.Config }}
    - name: {{ $element.Name }}
      configMap:
        name: {{ $element.Name }}
    {{- end }}
    {{- end }}

    {{- if $hasSecret }}
    {{- range $element := $secrets }}
    - name: {{ $element.Name }}
      secret:
        secretName: {{ $element.Name }}
    {{- end }}
    {{- end }}

    {{- if $config }}
    - name: config
      configMap:
        name: config
    {{- end }}

    {{- end }}

    terminationGracePeriodSeconds: 30
      
{{- end }}
