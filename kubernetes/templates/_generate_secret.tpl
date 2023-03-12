{{- define "powerpi.generate-secret" }}
{{- $secretObj := (lookup "v1" "Secret" .Release.Namespace .Params.Name) | default dict }}
{{- $secretData := (get $secretObj "data") | default dict }}
{{- $secret := (get $secretData .Params.Key) | default (randAlphaNum 32 | b64enc) }}
  {{ .Params.Key }}: {{ $secret | quote }}
  {{- if eq (empty .Params.Id) false }}
  {{- $id := (get $secretData .Params.Id) | default (uuidv4 | b64enc) }}
  {{ .Params.Id }}: {{ $id | quote }}
  {{- end }}
{{- end }}
