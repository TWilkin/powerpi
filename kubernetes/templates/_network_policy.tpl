{{- define "powerpi.network-policy-part" -}}

{{- if eq (empty .Params.Namespace) false }}
- namespaceSelector:
    matchLabels:
      kubernetes.io/metadata.name: {{ .Params.Namespace }}
{{- end }}

{{- if eq (and (empty .Params.Label) (empty .Params.Component)) false }}
- podSelector:
    matchLabels:
      {{- if eq (empty .Params.Label) false }}
      app.kubernetes.io/name: {{ .Params.Label }}
      {{- end }}
      {{- if eq (empty .Params.Component) false }}
      app.kubernetes.io/component: {{ .Params.Component }}
      {{- end }}
{{- end }}

{{- if eq (empty .Params.Cidr) false }}
- ipBlock:
    cidr: {{ .Params.Cidr }}

    {{- if eq (empty .Params.Except) false }}
    except:
    {{- range $except := .Params.Except }}
    - {{ $except }}
    {{- end }}
    {{- end }}
{{- end }}

{{- if eq (empty .Params.Port) false }}
ports:
- protocol: {{ default "TCP" .Params.Protocol }}
  port: {{ .Params.Port }}
{{- end }}

{{- end -}}
