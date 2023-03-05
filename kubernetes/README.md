microk8s helm install --debug --namespace powerpi --create-namespace powerpi .

microk8s helm upgrade --debug --namespace powerpi powerpi .

microk8s helm list --all-namespaces
microk8s helm uninstall --debug --namespace powerpi powerpi
