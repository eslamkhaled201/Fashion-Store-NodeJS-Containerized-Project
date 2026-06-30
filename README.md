# Maison — Fashion Ecommerce Store

Full-stack fashion ecommerce built with React, Node.js, MySQL, and Kubernetes deployment manifests.

## Project structure

```
Fashion-Store-NodeJS-Containerized-Project/
├── backend/                       # Node.js API server
├── db/                            # fashion store database schema
├── frontend/                      # React SPA
└── kubernetes/                    # Kubernetes manifests and deploy scripts
    ├── MetalLoadBalancer/         # MetalLB manifests + deploy script
    │   ├── deploy-MetalLB.sh
    │   ├── metallb-native.yaml
    │   ├── metallb-native-13.yaml
    │   └── metallb-config.yaml
    ├── Secrets/                   # Kubernetes Secret manifests
    │   ├── deploy-secrets.sh
    │   └── secret.yml
    ├── configMaps/                # Kubernetes ConfigMap manifests
    │   ├── deploy-configmaps.sh
    │   ├── db-schema.yaml
    │   └── env-configmap.yml
    ├── fashoinApp-deployments/    # App deployments for backend, frontend, database
    │   ├── deploy-apps.sh
    │   ├── backend-deploy.yml
    │   ├── db-deploy.yml
    │   └── frontend-deploy.yml
    ├── services/                  # Kubernetes services and ingress rules
    │   ├── deploy-services.sh
    │   ├── backend-svc.yml
    │   ├── db-svc.yml
    │   ├── frontend-svc.yml
    │   └── IngressRoutingRules.yaml
    └── traefik/                  # Traefik ingress controller manifests
        ├── deploy-traefik.sh
        ├── kubernetes-crd-definition-v1.yml
        ├── kubernetes-crd-rbac.yml
        ├── traefikClusterRoleBinding.yml
        ├── traefik-ns-account.yaml
        ├── traefik-deployment.yaml
        └── traefik-service.yaml
```

## Key folders

- `backend/` — Express API, routes, auth, cart, orders and payments logic.
- `db/` — includes database schema which create fashion_store and insert sample data (users , products ..)
- `frontend/` — React app with Axios API client configured to use `/api`.
- `kubernetes/` — Cluster manifests separated by runtime responsibility.

## Local development

### Database

```bash
cd db
mysql -u root -p < schema.sql
```

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

## Kubernetes deployment using Bash scripts

Each Kubernetes component folder includes a deploy script that applies all YAML files from that folder.

### 1. Make scripts executable

```bash
chmod +x kubernetes/**/*.sh
```

### 2. Deploy MetalLB (load balancer)

```bash
cd kubernetes/MetalLoadBalancer
./deploy-MetalLB.sh
```

### 3. Deploy Traefik ingress controller

```bash
cd ../traefik
./deploy-traefik.sh
```

### 4. Deploy ConfigMaps

```bash
cd ../configMaps
./deploy-configmaps.sh
```

### 5. Deploy Secrets

```bash
cd ../Secrets
./deploy-secrets.sh
```

### 6. Deploy application workloads

```bash
cd ../fashoinApp-deployments
./deploy-apps.sh
```

### 7. Deploy services and ingress rules

```bash
cd ../services
./deploy-services.sh
```

## Verify deployment

From the project root or any folder, run:

```bash
kubectl get pods --all-namespaces
kubectl get svc
kubectl get ingress
```

If your cluster uses `fashionstore.com` as the host, ensure DNS or `/etc/hosts` points to the ingress IP.

## Important configuration notes

- `kubernetes/configMaps/env-configmap.yml` defines `CLIENT_URL` for backend CORS.
- `frontend/src/api/client.js` uses Axios with `baseURL: '/api'`, so the frontend expects backend traffic on the same origin under `/api`.
- `kubernetes/services/IngressRoutingRules.yaml` sends `/api` traffic to `backend-svc` and `/` traffic to `frontend-svc`.

## Troubleshooting

- If backend requests fail, verify `backend-svc` endpoints with:
  ```bash
  kubectl get endpoints backend-svc
  ```
- If Traefik is not routing ingress, check controller logs:
  ```bash
  kubectl logs -n default -l app=traefik
  ```
- If CORS fails, confirm `CLIENT_URL` matches the actual frontend origin.

## Project features

- JWT auth with roles
- Product search, categories, filters
- Cart, checkout, Stripe payments
- Admin dashboard and product management
- File upload via Multer

## Notes

For production, secure secrets, use HTTPS, and replace local file upload storage with a cloud storage provider.
