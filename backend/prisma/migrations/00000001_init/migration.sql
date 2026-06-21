-- Migration: create Nfe table
CREATE TABLE IF NOT EXISTS "Nfe" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "chave" text UNIQUE,
  "emitente_nome" text,
  "emitente_cnpj" text,
  "destinatario_nome" text,
  "destinatario_cnpj" text,
  "valor_total" numeric(18,2),
  "data_emissao" timestamptz,
  "operacao" text,
  "raw_xml" text,
  "createdAt" timestamptz DEFAULT now(),
  "updatedAt" timestamptz DEFAULT now()
);

