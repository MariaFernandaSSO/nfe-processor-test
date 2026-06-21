-- Migration: add xml_hash column to Nfe
ALTER TABLE "Nfe" ADD COLUMN IF NOT EXISTS "xml_hash" text;
CREATE UNIQUE INDEX IF NOT EXISTS "idx_nfe_xml_hash" ON "Nfe" ("xml_hash");

