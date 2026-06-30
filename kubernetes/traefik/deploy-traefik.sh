SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

kubectl apply -f "$SCRIPT_DIR/kubernetes-crd-definition-v1.yml"
kubectl apply -f "$SCRIPT_DIR/kubernetes-crd-rbac.yml"
kubectl apply -f "$SCRIPT_DIR/traefik-ns-account.yaml"
kubectl apply -f "$SCRIPT_DIR/traefikClusterRoleBinding.yml"
kubectl apply -f "$SCRIPT_DIR/traefik-deployment.yaml"
kubectl apply -f "$SCRIPT_DIR/traefik-service.yaml"