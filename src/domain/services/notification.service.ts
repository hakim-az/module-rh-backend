import { Injectable } from "@nestjs/common";
import { CreateNotificationUseCase } from "@/application/use-cases/notification/create-notification.use-case";

@Injectable()
export class NotificationService {
  constructor(private createNotificationUseCase: CreateNotificationUseCase) {}

  // Notification pour changement de statut d'absence
  async notifyAbsenceStatusChange(
    userId: string,
    absenceType: string,
    newStatus: string,
    dateDebut: string,
    dateFin: string,
    motifDeRefus?: string
  ): Promise<void> {
    let title: string;
    let message: string;

    switch (newStatus) {
      case "approuver":
        title = "Demande d'absence approuvée";
        message = `Votre demande d'absence (${absenceType}) du ${dateDebut} au ${dateFin} a été approuvée.`;
        break;
      case "refuser":
        title = "Demande d'absence refusée";
        message = `Votre demande d'absence (${absenceType}) du ${dateDebut} au ${dateFin} a été refusée.${motifDeRefus ? ` Motif: ${motifDeRefus}` : ""}`;
        break;
      case "en-attente":
        title = "Demande d'absence en attente";
        message = `Votre demande d'absence (${absenceType}) du ${dateDebut} au ${dateFin} est en cours de traitement.`;
        break;
      default:
        return;
    }

    await this.createNotificationUseCase.execute({
      userId,
      title,
      message,
    });
  }

  // Notification pour nouvelle demande d'absence (pour les RH)
  async notifyNewAbsenceRequest(
    rhUserIds: string[],
    employeeName: string,
    absenceType: string,
    dateDebut: string,
    dateFin: string
  ): Promise<void> {
    const title = "Nouvelle demande d'absence";
    const message = `${employeeName} a soumis une nouvelle demande d'absence (${absenceType}) du ${dateDebut} au ${dateFin}.`;

    for (const userId of rhUserIds) {
      await this.createNotificationUseCase.execute({
        userId,
        title,
        message,
      });
    }
  }

  // Notification personnalisée
  async createCustomNotification(
    userId: string,
    title: string,
    message: string
  ): Promise<void> {
    await this.createNotificationUseCase.execute({
      userId,
      title,
      message,
    });
  }

  // Notification de rappel
  async createReminderNotification(
    userId: string,
    subject: string,
    dueDate: string
  ): Promise<void> {
    const title = "Rappel";
    const message = `N'oubliez pas: ${subject} - Échéance: ${dueDate}`;

    await this.createNotificationUseCase.execute({
      userId,
      title,
      message,
    });
  }

  // Notification de bienvenue
  async createWelcomeNotification(
    userId: string,
    userName: string
  ): Promise<void> {
    const title = "Bienvenue !";
    const message = `Bienvenue ${userName} ! Votre compte a été créé avec succès.`;

    await this.createNotificationUseCase.execute({
      userId,
      title,
      message,
    });
  }
}
