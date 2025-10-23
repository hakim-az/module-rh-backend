-- RenameForeignKey
ALTER TABLE "absences" RENAME CONSTRAINT "absences_id_user_fkey" TO "fk_absence_user";

-- RenameForeignKey
ALTER TABLE "coffres" RENAME CONSTRAINT "coffres_id_user_fkey" TO "fk_coffre_user";

-- RenameForeignKey
ALTER TABLE "notifications" RENAME CONSTRAINT "notifications_userId_fkey" TO "fk_notification_user";

-- RenameForeignKey
ALTER TABLE "restaux" RENAME CONSTRAINT "restaux_id_user_fkey" TO "fk_restau_user";

-- RenameIndex
ALTER INDEX "absences_id_user_idx" RENAME TO "absences_id_user_fkey";

-- RenameIndex
ALTER INDEX "coffres_id_user_idx" RENAME TO "coffres_id_user_fkey";

-- RenameIndex
ALTER INDEX "notifications_userId_idx" RENAME TO "notifications_userId_fkey";

-- RenameIndex
ALTER INDEX "restaux_id_user_idx" RENAME TO "restaux_id_user_fkey";
