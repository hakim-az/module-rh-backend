export class Email {
  constructor(public readonly value: string) {
    if (!this.isValid()) {
      throw new Error("Invalid email format");
    }
  }

  public isValid(): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(this.value);
  }

  public getDomain(): string {
    return this.value.split("@")[1];
  }

  public toString(): string {
    return this.value;
  }
}
