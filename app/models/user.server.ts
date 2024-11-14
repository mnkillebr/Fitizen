import { FitnessProfile, Prisma, Role } from "@prisma/client";
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

export async function updateUserProfile(userId: string, email: string, firstName: string, lastName: string) {
  try {
    const user = await db.user.update({
      where: {
        id: userId
      },
      data: {
        email,
        firstName,
        lastName,
      }
    })
    return user
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2011") {
        return error.message
      }
    }
    throw error
  };
}

export async function updateUserProfilePhoto(userId: string, profilePhotoUrl: string, profilePhotoId: string) {
  try {
    const user = await db.user.update({
      where: {
        id: userId
      },
      data: {
        profilePhotoUrl,
        profilePhotoId,
      }
    })
    return user
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2011") {
        return error.message
      }
    }
    throw error
  };
}

export async function updateUserFitnessProfile(userId: string, profile: FitnessProfile) {
  try {
    const user = await db.user.update({
      where: {
        id: userId
      },
      data: {
        fitnessProfile: {
          upsert: {
            create: profile,
            update: profile,
          },
        }
      }
    })
    return user
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2011") {
        return error.message
      }
    }
    throw error
  };
}
