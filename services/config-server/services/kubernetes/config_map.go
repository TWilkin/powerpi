package kubernetes

import (
	"context"
	"fmt"

	"powerpi/common/services/logger"
	"powerpi/config-server/services/config"

	corev1 "k8s.io/api/core/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	k8s "k8s.io/client-go/kubernetes"
	v1 "k8s.io/client-go/kubernetes/typed/core/v1"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

type ConfigMapService interface {
	GetChecksum(ctx context.Context, name string) (*string, error)
	Write(ctx context.Context, name string, fileName string, content string, checksum string) error
}

type configMapService struct {
	config config.ConfigService
	logger logger.LoggerService

	clientset *k8s.Clientset
}

func NewConfigMapService(config config.ConfigService, logger logger.LoggerService) (ConfigMapService, error) {
	k8sConfig, err := rest.InClusterConfig()
	if err != nil {
		// fallback to kubeconfig for local development
		k8sConfig, err = clientcmd.BuildConfigFromFlags("", clientcmd.RecommendedHomeFile)
		if err != nil {
			return nil, err
		}
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

func (configMap *configMapService) getConfigMapInterface(ctx context.Context, name string) v1.ConfigMapInterface {
	return configMap.clientset.
		CoreV1().
		ConfigMaps(configMap.config.GetKubernetesConfig().Namespace)
}

func (configMap *configMapService) getConfigMap(ctx context.Context, name string) (*corev1.ConfigMap, error) {
	return configMap.getConfigMapInterface(ctx, name).Get(ctx, name, metav1.GetOptions{})
}

func (configMap *configMapService) writeConfigMap(ctx context.Context, name string, definition *corev1.ConfigMap) (*corev1.ConfigMap, error) {
	return configMap.getConfigMapInterface(ctx, name).Update(ctx, definition, metav1.UpdateOptions{})
}

func (configMap *configMapService) GetChecksum(ctx context.Context, name string) (*string, error) {
	definition, err := configMap.getConfigMap(ctx, name)
	if err != nil {
		configMap.logger.Warn("Failed to find ConfigMap", "name", name, "err", err)
		return nil, err
	}

	checksum, okay := definition.Annotations[fmt.Sprintf("checksum/%s", name)]
	if !okay {
		configMap.logger.Info("ConfigMap has no checksum", "name", name)
	}

	return &checksum, nil
}

func (configMap *configMapService) Write(ctx context.Context, name string, fileName string, content string, checksum string) error {
	definition, err := configMap.getConfigMap(ctx, name)
	if err != nil {
		configMap.logger.Warn("Failed to find ConfigMap", "name", name, "err", err)
		return err
	}

	if definition.Data == nil {
		definition.Data = make(map[string]string)
	}

	if definition.Annotations == nil {
		definition.Annotations = make(map[string]string)
	}

	definition.Data[fileName] = content
	definition.Annotations[fmt.Sprintf("checksum/%s", name)] = checksum

	_, err = configMap.writeConfigMap(ctx, name, definition)
	return err
}
