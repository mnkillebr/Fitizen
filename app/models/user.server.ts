import { Prisma } from "@prisma/client";
import db from "~/db.server";

export function getUserByEmail(email: string) {
  return db.user.findUnique({
    where: {
      email: email,
    }
  });
};

export function createUser(email: string, firstName: string, lastName: string) {
  return db.user.create({
    data: {
      email,
      firstName,
      lastName,
    }
  });
};
