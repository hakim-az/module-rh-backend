export class Acces {
  type(type: any) {
    throw new Error("Method not implemented.");
  }
  constructor(
    public id: string,
    public userId: string,
    public status: string,
    public productCode: string,
    public password?: string,
    public email?: string,
    public createdAt?: Date,
    public updatedAt?: Date
  ) {}

  public static create(
    userId: string,
    status: string,
    productCode: string,
    password?: string,
    email?: string
  ): Acces {
    return new Acces(
      "0",
      userId,
      status,
      productCode,
      password,
      email,
      new Date(),
      new Date()
    );
  }
}
