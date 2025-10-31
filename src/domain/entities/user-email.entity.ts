export class UserEmail {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public upn: string,
    public password: string,
    public displayName: string,
    public alias?: string,
    public licenseSku?: string,
    public isEnabled = true,
    public isDeleted = false,
    public deletedAt?: Date,
    public readonly createdAt?: Date,
    public updatedAt?: Date
  ) {}

  enable() {
    this.isEnabled = true;
  }
  disable() {
    this.isEnabled = false;
  }
  softDelete() {
    this.isDeleted = true;
    this.deletedAt = new Date();
  }
  updatePassword(newPassword: string) {
    this.password = newPassword;
  }
}
