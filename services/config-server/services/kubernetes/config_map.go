package kubernetes

import (
	"context"
	"fmt"

	"powerpi/common/services/logger"
	"powerpi/config-server/services/config"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	k8s "k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
)

type ConfigMapService interface {
	GetChecksum(ctx context.Context, name string) (*string, error)
}

type configMapService struct {
	config config.ConfigService
	logger logger.LoggerService

	clientset *k8s.Clientset
}

func NewConfigMapService(config config.ConfigService, logger logger.LoggerService) (ConfigMapService, error) {
	k8sConfig, err := rest.InClusterConfig()
	if err != nil {
		return nil, err
	}

	clientset, err := k8s.NewForConfig(k8sConfig)
	if err != nil {
		return nil, err
	}

	return &configMapService{
		config:    config,
		logger:    logger,
		clientset: clientset,
	}, nil
}

func (configMap *configMapService) getConfigMap(ctx context.Context, name string) (*corev1.ConfigMap, error) {
	return configMap.clientset.
		CoreV1().
		ConfigMaps(configMap.config.GetKubernetesConfig().Namespace).
		Get(ctx, name, metav1.GetOptions{})
}

func (configMap *configMapService) GetChecksum(ctx context.Context, name string) (*string, error) {
	definition, err := configMap.getConfigMap(ctx, name)
	if err != nil {
		configMap.logger.Warn("Failed to find ConfigMap", name, err)
		return nil, err
	}

	checksum, okay := definition.Annotations[fmt.Sprintf("checksum/%s", name)]
	if !okay {
		configMap.logger.Info("ConfigMap has no checksum", name)
	}

	return &checksum, nil
}
