# NFe Processor

Aplicação Full Stack para processamento assíncrono de arquivos XML de NF-e (Nota Fiscal Eletrônica).

## Funcionalidades

- Upload de XMLs de NF-e com processamento assíncrono via fila (BullMQ/Redis)
- Parse automático dos campos: chave, emitente, destinatário, CNPJs, valor total e data de emissão
- Identificação da operação (entrada/saída) com base em clientes internos cadastrados
- Deduplicação por hash SHA-256 e chave da NF-e
- Documentação Swagger em `/api/docs`
- Tela de upload com feedback visual
- Tela de resumo por cliente (contagem de compras e vendas)
- Tela de XMLs não identificados

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Backend | Node.js + TypeScript + Express |
| Frontend | React + TypeScript + Vite |
| Fila | BullMQ (Redis) |
| Banco | PostgreSQL via Prisma ORM |
| Parse XML | fast-xml-parser |
| Testes | Jest |
| Container | Docker Compose |

## Estrutura

```
nfe-processor-test/
├── backend/
│   ├── src/
│   │   ├── main.ts              # Servidor Express + upload
│   │   ├── worker.ts            # Consumer da fila
│   │   ├── nfeProcessor.ts      # Parse XML + lógica de negócio
│   │   ├── nfeRoutes.ts         # Endpoints REST
│   │   ├── errorMiddleware.ts   # Tratamento global de erros
│   │   ├── queue.ts             # Config BullMQ
│   │   └── prisma.ts            # PrismaClient
│   ├── data/clients.json        # Mock de clientes internos
│   ├── prisma/schema.prisma     # Schema do banco
│   └── test/                    # Testes unitários
├── frontend/
│   └── src/
│       ├── api.ts               # Cliente HTTP
│       ├── App.tsx              # Componente principal
│       └── components/
│           ├── UploadXml.tsx
│           ├── ResumoClientes.tsx
│           └── NaoIdentificados.tsx
├── docker-compose.yml
└── README.md
```

## Como executar

### Docker Compose (recomendado)

```bash
docker compose up --build
```

Isso inicia:
- PostgreSQL na porta 5432
- Redis na porta 6379
- Backend na porta 3000
- Frontend na porta 5173
- Worker (processamento assíncrono)

### Execução local

**Pré-requisitos:** Node.js 20+, PostgreSQL, Redis

```bash
# Backend
cd backend
cp .env.example .env   # ajuste as URLs se necessário
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run dev             # terminal 1 - servidor HTTP
npm run worker          # terminal 2 - consumer da fila

# Frontend
cd frontend
npm install
npm run dev
```

O frontend fica disponível em `http://localhost:5173`.

### Variáveis de ambiente (backend)

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `DATABASE_URL` | URL de conexão PostgreSQL | `postgresql://postgres:postgres@localhost:5432/nfe_db` |
| `REDIS_URL` | URL de conexão Redis | `redis://localhost:6379` |
| `PORT` | Porta do servidor HTTP | `3000` |

### Clientes internos

Os clientes são definidos em `backend/data/clients.json` e usados pelo worker para identificar a operação:

```json
{
  "clients": [
    { "id": 1, "name": "Empresa ABC", "cnpj": "12345678000199" },
    { "id": 2, "name": "Empresa XPTO", "cnpj": "98765432000155" }
  ]
}
```

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/v1/xml/upload` | Upload de arquivos XML (multipart, field: `files`) |
| GET | `/api/v1/nfe` | Lista todas NF-es processadas |
| GET | `/api/v1/nfe/resumo` | Resumo por cliente (compra/venda) |
| GET | `/api/v1/nfe/nao-identificados` | Lista NF-es sem vínculo |
| GET | `/api/docs` | Documentação Swagger |

### Exemplo de upload

```bash
curl -X POST http://localhost:3000/api/v1/xml/upload \
  -F "files=@nota-fiscal.xml"
```

## Testes

```bash
cd backend
npm test
```
