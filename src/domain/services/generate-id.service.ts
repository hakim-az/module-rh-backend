import { PrismaClient } from "@prisma/client";
import { customAlphabet } from "nanoid";

const prisma = new PrismaClient();
const nanoidNumeric = customAlphabet("0123456789", 7); // 7-digit numeric string

export async function generateUniqueNumericId(
  model: keyof PrismaClient,
  idField: string = "id"
): Promise<string> {
  let id: string;
  let exists: boolean;

  do {
    id = nanoidNumeric();
    const record = await (prisma[model] as any).findUnique({
      where: { [idField]: id },
    });
    exists = !!record;
  } while (exists);

  return id;
}
