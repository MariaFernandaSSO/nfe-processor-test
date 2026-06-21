# Teste Técnico – Desenvolvedor Full Stack Pleno

## Objetivo

Desenvolver uma aplicação Full Stack capaz de receber arquivos XML de NF-e, realizar o parse das informações fiscais, consultar uma API de clientes internos e identificar se a operação representa:

- Nota fiscal de entrada (compra)
- Nota fiscal de saída (venda)

O processamento deverá ser **assíncrono**: todo XML recebido no upload é enviado para uma fila e, em seguida, processado por um consumer. O parse, a consulta à API de clientes internos, a identificação da operação e a persistência ocorrem no consumer — inclusive para os XMLs que não possuírem vínculo com clientes internos, que deverão ser marcados como "Não identificado".

O objetivo deste teste é avaliar:

- Organização de código
- Estruturação de projeto
- Conhecimento backend e frontend
- Integração entre sistemas
- Manipulação de XML
- Tratamento de regras de negócio
- Qualidade da API
- Clareza na implementação

---

# Cenário

A aplicação deverá receber arquivos XML de NF-e.

No upload:

1. Os arquivos deverão ser recebidos e validados
2. Todo XML deverá ser enviado para uma fila para processamento posterior

No consumer (processamento assíncrono da fila):

3. O XML deverá ser processado
4. As principais informações deverão ser extraídas
5. A aplicação deverá consultar uma API externa de clientes internos
6. O sistema deverá identificar se o XML pertence a:
   - Entrada (compra)
   - Saída (venda)
   - Não identificado (sem vínculo com clientes internos)
7. As informações deverão ser persistidas

---

# Regras de Negócio

## Identificação de operação

A identificação deverá ocorrer com base no CNPJ do emitente e destinatário.

### Exemplo

- Se o destinatário for um cliente interno:
  - Operação = Entrada (Compra)

- Se o emitente for um cliente interno:
  - Operação = Saída (Venda)

---

# Clientes

A aplicação deverá consumir um arquivo externo que retorna clientes internos.

A implementação da API mock pode ser realizada da forma que o candidato preferir.

---

# Funcionalidades Obrigatórias

## Backend

A aplicação backend deverá possuir:

### 1. Endpoint para upload de XML

Exemplo:

```http
POST /xml/upload
```

O endpoint deverá:

- Receber um ou múltiplos XMLs
- Validar arquivos
- Enviar cada XML para a fila

> O processamento (parse, identificação e persistência) **não** ocorre no upload — acontece no consumer, de forma assíncrona.

---

### 2. Parse do XML (no consumer)

O sistema deverá extrair informações relevantes, como:

- Chave da NF-e
- Emitente
- Destinatário
- CNPJ emitente
- CNPJ destinatário
- Valor total
- Data de emissão

---

### 3. Identificação da operação

Classificar o XML como:

- Compra
- Venda
- Não identificado

---

### 4. Integração com API externa

Consultar clientes internos do arquivo.

---

### 5. Fila + Consumer

**Todo** XML recebido no upload deverá ser enviado para uma fila e processado de forma assíncrona por um consumer. O consumer é responsável pelo parse, consulta à API de clientes, identificação da operação e persistência — inclusive dos XMLs sem vínculo (classificados como "Não identificado").

A implementação da fila pode utilizar:

- RabbitMQ
- Redis/BullMQ
- Fila em memória
- Outra solução equivalente

---

### 6. Swagger/OpenAPI

A API deverá possuir documentação.

---

# Frontend

A aplicação frontend deverá possuir:

## 1. Tela de upload de XML

Funcionalidades esperadas:

- Seleção de arquivos
- Envio dos XMLs
- Feedback visual
- Tratamento básico de erros

---

## 2. Resumo por cliente

Exibir:

- Nome do cliente
- Quantidade de XMLs
- Tipo de operação

Exemplo:

| Cliente | Compra | Venda |
|---|---|---|
| Empresa ABC | 12 | 5 |
| Empresa XPTO | 7 | 1 |

---

## 3. XMLs sem vínculo

Exibir lista contendo:

- Nome emitente/destinatário
- CNPJ
- Motivo da não identificação

---

# Requisitos Técnicos

## Backend

Linguagem livre.

Exemplos:

- Node.js
- Python
- Go
- Rust

---

## Frontend

Framework livre.

Exemplos:

- React
- Vue
- Angular

---

## Banco de dados

Livre.

Exemplos:

- PostgreSQL
- MySQL
- SQLite

---

# Diferenciais

Serão considerados diferenciais:

- Docker
- Docker Compose
- Testes automatizados
- Arquitetura organizada
- Logs
- Tratamento de erros
- Boas práticas
- README detalhado
- Interface amigável
- Processamento assíncrono

---

# O que será avaliado

## Backend

- Estrutura do projeto
- Organização de código
- Clareza da implementação
- Separação de responsabilidades
- Qualidade da API
- Tratamento de erros

---

## Frontend

- Organização dos componentes
- Experiência de uso
- Clareza visual
- Consumo correto da API

---

## Geral

- Capacidade de resolução
- Raciocínio técnico
- Legibilidade
- Simplicidade
- Documentação

---

# Não é necessário

Não esperamos:

- Arquitetura extremamente complexa
- Microserviços
- Kubernetes
- Sistema enterprise completo
- Infraestrutura avançada
- Layout extremamente elaborado

O foco é qualidade técnica e clareza.

---

# Entrega

Disponibilizar:

- Repositório Git
- README com instruções de execução
- Variáveis de ambiente necessárias
- Passos para subir backend/frontend
- Exemplos de uso

---


# Observações

O candidato possui liberdade para definir:

- Estrutura do projeto
- Tecnologias utilizadas
- Organização das camadas
- Estratégia de persistência
- Estratégia da fila

Priorizamos:

- Clareza
- Organização
- Simplicidade
- Boas práticas
- Capacidade de explicar decisões técnicas
