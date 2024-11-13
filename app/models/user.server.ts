import { Prisma, Role } from "@prisma/client";
import db from "~/db.server";

export function getUserByEmail(email: string) {
  return db.user.findUnique({
    where: {
      email: email,
    }
  });
};

export function getUserById(userId: string) {
  return db.user.findUnique({
    where: {
      id: userId,
    }
  });
};

export function createUser(email: string, firstName: string, lastName: string) {
  return db.user.create({
    data: {
      role: Role.user,
      email,
      firstName,
      lastName,
    }
  });
};

export function updateUserProfile(userId: string, email: string, firstName: string, lastName: string) {
  return db.user.update({
    where: {
      id: userId
    },
    data: {
      email,
      firstName,
      lastName,
    }
  })
}

export function updateUserProfilePhoto(userId: string, profilePhotoUrl: string, profilePhotoId: string) {
  return db.user.update({
    where: {
      id: userId
    },
    data: {
      profilePhotoUrl,
      profilePhotoId,
    }
  })
}
