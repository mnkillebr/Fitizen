import { Prisma } from "@prisma/client";
import db from "~/db.server";

export function getAllExercises(query: string | null) {
  return db.exercise.findMany({
    where: {
      name: {
        contains: query || "",
        mode: "insensitive",
      },
    },
    orderBy: [
      {
        createdAt: "desc",
      },
      {
        name: "desc",
      }
    ],
  });
};

export async function getAllExercisesPaginated(query: string | null, skip: number | undefined, take: number | undefined) {
  try {
    const [exercises, count] = await Promise.all([
      db.exercise.findMany({
        where: {
          name: {
            contains: query || "",
            mode: "insensitive",
          },
        },
        orderBy: [
          { createdAt: "desc" },
          { name: "desc" },
        ],
        skip,
        take,
      }),
      db.exercise.count({
        where: {
          name: {
            contains: query || "",
            mode: "insensitive",
          },
        },
      })
    ])
    return { exercises, count }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2011") {
        return error.message
      }
      if (error.code === "P2025") {
        return error.message
      }
    }
    throw error
  };
};

export function getExercisesById(exerciseIds: string[]) {
  return db.exercise.findMany({
    where: {
      id: {
        in: exerciseIds
      }
    }
  });
};

export function createExercise() {
  return db.exercise.create({
    data: {
      name: "Fake exercise",
    }
  });
};

export async function deleteExercise(exerciseId: string) {
  try {
    const deletedExercise = await db.exercise.delete({
      where: {
        id: exerciseId,
      }
    })
    return deletedExercise
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return error.message
      }
    }
    throw error
  };
};

export function updateExerciseName(exerciseId: string, exerciseName: string) {
  return db.exercise.update({
    where: {
      id: exerciseId,
    },
    data: {
      name: exerciseName,
    }
  });
};
