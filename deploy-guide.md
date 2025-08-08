# 🚀 Guia de Deploy - Sistema de Indicações

## 📋 Pré-requisitos
- VPS com Docker e Portainer instalados
- Domínio registrado
- Acesso SSH à VPS

## 🔧 Passo a Passo

### 1. **Preparar arquivos na VPS**
```bash
# Conectar via SSH
ssh usuario@sua-vps-ip

# Criar diretório do projeto
mkdir -p /opt/sistema-indicacoes
cd /opt/sistema-indicacoes

# Fazer upload dos arquivos (via SCP ou Git)
```

### 2. **Deploy via Portainer**

#### Opção A: Via Stack (Recomendado)
1. Acesse Portainer: `http://sua-vps-ip:9000`
2. Vá em **Stacks** → **Add Stack**
3. Nome: `sistema-indicacoes`
4. Cole o conteúdo do `docker-compose.yml`
5. Clique em **Deploy the stack**

#### Opção B: Via Container
1. **Containers** → **Add Container**
2. **Name**: `sistema-indicacoes`
3. **Image**: `node:18-alpine`
4. **Port mapping**: `3000:80`
5. **Volumes**: `/opt/sistema-indicacoes:/app`
6. **Command**: `sh -c "cd /app && npm install && npm run build && npx serve -s dist -l 80"`

### 3. **Configurar Proxy Reverso (Nginx)**
```nginx
server {
    listen 80;
    server_name seudominio.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 4. **SSL com Let's Encrypt**
```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seudominio.com

# Renovação automática
sudo crontab -e
# Adicionar: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 🌐 Configuração de Domínio

### 1. **Registrar Domínio**
- **Registro.br** (para .com.br)
- **Namecheap**, **GoDaddy**, **Cloudflare**

### 2. **Configurar DNS**
```
Tipo: A
Nome: @
Valor: IP-DA-SUA-VPS
TTL: 3600

Tipo: A  
Nome: www
Valor: IP-DA-SUA-VPS
TTL: 3600
```

### 3. **Cloudflare (Opcional)**
- Adicionar domínio no Cloudflare
- Alterar nameservers no registrador
- Ativar SSL/TLS Full

## 📡 Integração com Webhooks

### 1. **Endpoint para receber dados**
Criar endpoint na sua API/n8n:
```
POST /webhook/indicacoes
Content-Type: application/json

{
  "totalIndications": 150,
  "monthlyIndications": 25,
  "closedDeals": 45,
  "pendingDeals": 80,
  "notInterested": 25,
  "topReferrers": [
    {
      "user_id": "user-123",
      "user_name": "João Silva",
      "total_indications": 35
    }
  ]
}
```

### 2. **Atualizar frontend para consumir API**
O sistema já está preparado para receber dados via HTTP.

## 🔍 Monitoramento
- **Logs**: `docker logs sistema-indicacoes`
- **Status**: Portainer Dashboard
- **Métricas**: Configurar Grafana + Prometheus

## 🛠️ Troubleshooting
- Verificar portas abertas: `netstat -tlnp`
- Testar conectividade: `curl http://localhost:3000`
- Logs do container: `docker logs -f sistema-indicacoes`