-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "statut" TEXT NOT NULL,
    "civilite" TEXT,
    "prenom" TEXT NOT NULL,
    "nomDeNaissance" TEXT NOT NULL,
    "nomUsuel" TEXT,
    "situationFamiliale" TEXT,
    "numeroSecuriteSociale" TEXT,
    "emailPersonnel" TEXT NOT NULL,
    "emailProfessionnel" TEXT,
    "telephonePersonnel" TEXT NOT NULL,
    "telephoneProfessionnel" TEXT,
    "avatar" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "naissances" (
    "id" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "date_de_naissance" TIMESTAMP(3) NOT NULL,
    "paysDeNaissance" TEXT NOT NULL,
    "departementDeNaissance" TEXT NOT NULL,
    "communeDeNaissance" TEXT NOT NULL,
    "paysDeNationalite" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "naissances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "adresses" (
    "id" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "pays" TEXT NOT NULL,
    "codePostal" TEXT NOT NULL,
    "ville" TEXT NOT NULL,
    "adresse" TEXT NOT NULL,
    "complementAdresse" TEXT NOT NULL,
    "domiciliteHorsLaFrance" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "adresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "paiements" (
    "id" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "iban" TEXT NOT NULL,
    "bic" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "paiements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "urgences" (
    "id" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "nomComplet" TEXT NOT NULL,
    "lienAvecLeSalarie" TEXT NOT NULL,
    "telephone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "urgences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "justificatifs" (
    "id" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "fichier_carte_vitale_pdf" TEXT NOT NULL,
    "fichier_rib_pdf" TEXT NOT NULL,
    "fichier_piece_identite_pdf" TEXT NOT NULL,
    "fichier_piece_identite_pdf_verso" TEXT NOT NULL,
    "fichier_justificatif_domicile_pdf" TEXT NOT NULL,
    "autre_fichier" TEXT NOT NULL,
    "fichier_ameli" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "justificatifs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contrats" (
    "id" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "poste" TEXT NOT NULL,
    "typeContrat" TEXT NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "etablissementDeSante" TEXT NOT NULL,
    "serviceDeSante" TEXT NOT NULL,
    "matricule" TEXT NOT NULL,
    "salaire" TEXT NOT NULL,
    "fichier_contrat_non_signer_pdf" TEXT,
    "fichier_contrat_signer_pdf" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contrats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "absences" (
    "id" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "typeAbsence" TEXT NOT NULL,
    "date_debut" TIMESTAMP(3) NOT NULL,
    "date_fin" TIMESTAMP(3) NOT NULL,
    "partieDeJour" TEXT,
    "note" TEXT,
    "statut" TEXT,
    "motifDeRefus" TEXT,
    "fichier_justificatif_pdf" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "absences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coffres" (
    "id" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "typeBulletin" TEXT NOT NULL,
    "mois" TEXT NOT NULL,
    "annee" TEXT NOT NULL,
    "note" TEXT,
    "fichier_justificatif_pdf" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coffres_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "restaux" (
    "id" TEXT NOT NULL,
    "id_user" TEXT NOT NULL,
    "nbrJours" TEXT NOT NULL,
    "mois" TEXT NOT NULL,
    "annee" TEXT NOT NULL,
    "note" TEXT,
    "fichier_justificatif_pdf" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "restaux_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_emailPersonnel_key" ON "users"("emailPersonnel");

-- CreateIndex
CREATE UNIQUE INDEX "users_emailProfessionnel_key" ON "users"("emailProfessionnel");

-- CreateIndex
CREATE UNIQUE INDEX "naissances_id_user_key" ON "naissances"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "adresses_id_user_key" ON "adresses"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "paiements_id_user_key" ON "paiements"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "urgences_id_user_key" ON "urgences"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "justificatifs_id_user_key" ON "justificatifs"("id_user");

-- CreateIndex
CREATE UNIQUE INDEX "contrats_id_user_key" ON "contrats"("id_user");

-- CreateIndex
CREATE INDEX "absences_id_user_idx" ON "absences"("id_user");

-- CreateIndex
CREATE INDEX "coffres_id_user_idx" ON "coffres"("id_user");

-- CreateIndex
CREATE INDEX "restaux_id_user_idx" ON "restaux"("id_user");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- AddForeignKey
ALTER TABLE "naissances" ADD CONSTRAINT "naissances_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "adresses" ADD CONSTRAINT "adresses_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "paiements" ADD CONSTRAINT "paiements_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "urgences" ADD CONSTRAINT "urgences_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "justificatifs" ADD CONSTRAINT "justificatifs_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contrats" ADD CONSTRAINT "contrats_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "absences" ADD CONSTRAINT "absences_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coffres" ADD CONSTRAINT "coffres_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "restaux" ADD CONSTRAINT "restaux_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
