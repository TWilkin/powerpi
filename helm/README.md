microk8s helm install --debug --namespace powerpi --create-namespace --generate-name .

microk8s helm list --all-namespaces
microk8s helm uninstall --debug --namespace powerpi chart-1678021577
