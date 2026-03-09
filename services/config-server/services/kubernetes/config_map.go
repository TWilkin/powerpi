package kubernetes

import (
	"context"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	k8s "k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

type ConfigMapService interface {
	GetConfigMap(ctx context.Context, name string) (*corev1.ConfigMap, error)
}

type configMapService struct {
	clientset *k8s.Clientset
}

func NewConfigMapService() (ConfigMapService, error) {
	config, err := rest.InClusterConfig()
	if err != nil {
		return nil, err
	}

	clientset, err := k8s.NewForConfig(config)
	if err != nil {
		return nil, err
	}

	return &configMapService{
		clientset: clientset,
	}, nil
}

func (configMap *configMapService) GetConfigMap(ctx context.Context, name string) (*corev1.ConfigMap, error) {
	return configMap.clientset.CoreV1().ConfigMaps("powerpi").Get(ctx, name, metav1.GetOptions{})
}
