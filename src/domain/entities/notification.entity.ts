export class Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    nomDeNaissance: string;
    prenom: string;
    emailProfessionnel: string;
    avatar?: string;
  };

  constructor(data: Partial<Notification>) {
    Object.assign(this, data);
  }
}
