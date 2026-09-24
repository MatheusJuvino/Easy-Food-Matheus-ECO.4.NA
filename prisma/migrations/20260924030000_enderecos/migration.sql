-- AlterTable
ALTER TABLE "User" ADD COLUMN "endereco" TEXT;
ALTER TABLE "User" ADD COLUMN "cidade" TEXT;
ALTER TABLE "User" ADD COLUMN "bairro" TEXT;
ALTER TABLE "User" ADD COLUMN "latitude" REAL;
ALTER TABLE "User" ADD COLUMN "longitude" REAL;

-- AlterTable
ALTER TABLE "Restaurant" ADD COLUMN "endereco" TEXT;
ALTER TABLE "Restaurant" ADD COLUMN "cidade" TEXT;
ALTER TABLE "Restaurant" ADD COLUMN "bairro" TEXT;
ALTER TABLE "Restaurant" ADD COLUMN "latitude" REAL;
ALTER TABLE "Restaurant" ADD COLUMN "longitude" REAL;
