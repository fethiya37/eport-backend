-- CreateTable
CREATE TABLE "association_subaccounts" (
    "id" SERIAL NOT NULL,
    "association_id" INTEGER NOT NULL,
    "chapa_id" TEXT NOT NULL,
    "business_name" TEXT NOT NULL,
    "account_name" TEXT NOT NULL,
    "account_number" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "association_subaccounts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "association_subaccounts_association_id_key" ON "association_subaccounts"("association_id");

-- CreateIndex
CREATE UNIQUE INDEX "association_subaccounts_chapa_id_key" ON "association_subaccounts"("chapa_id");

-- AddForeignKey
ALTER TABLE "association_subaccounts" ADD CONSTRAINT "association_subaccounts_association_id_fkey" FOREIGN KEY ("association_id") REFERENCES "associations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
