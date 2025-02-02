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
    },
    include: {
      fitnessProfile: true,
    }
  });
};

export function getUserByProvider(email: string, providerUserId: string) {
  return db.user.findFirst({
    where: {
      email,
      socialLogins: {
        some: {
          providerUserId,
        },
      },
    },
    include: {
      socialLogins: true,
    },
  })
}

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

export function createUserWithProvider(email: string, firstName: string, lastName: string, provider: string, providerUserId: string) {
  return db.user.create({
    data: {
      email: email!,
      firstName,
      lastName,
      role: Role.user,
      socialLogins: {
        create: [
          {
            provider,
            providerUserId,
          }
        ]
      }
    },
  });
}

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
      },
      include: {
        fitnessProfile: true,
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
