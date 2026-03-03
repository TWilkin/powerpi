package utils

import (
	"net/url"
	"path"
)

func GenerateURL(baseURL string, paths []string, params map[string]string) (string, error) {
	url, err := url.Parse(baseURL)
	if err != nil {
		return "", err
	}

	url.Path = path.Join(append([]string{url.Path}, paths...)...)

	query := url.Query()
	for key, value := range params {
		query.Set(key, value)
	}
	url.RawQuery = query.Encode()

	return url.String(), nil
}
