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
