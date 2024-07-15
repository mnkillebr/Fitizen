import { Prisma, SectionType } from "@prisma/client";
import db from "~/db.server";

export type ExerciseSchemaType = {
  exerciseId: string
  orderInRoutine: number
  section: SectionType
}

export function getWorkout(workoutId: string) {
  return db.routine.findUnique({
    where: {
      id: workoutId,
    }
  });
}

export function getAllWorkouts(query: string | null) {
  return db.routine.findMany({
    where: {
      name: {
        contains: query || "",
        mode: "insensitive",
      },
    },
    include: {
      exercises: true,
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

export function getAllUserWorkouts(userId: string, query: string | null) {
  return db.routine.findMany({
    where: {
      OR: [
        {
          userId,
          name: {
            contains: query || "",
            mode: "insensitive",
          },
        },
        {
          isFree: true,
          name: {
            contains: query || "",
            mode: "insensitive",
          },
        }
      ],
    },
    include: {
      exercises: true,
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

export async function createUserWorkoutWithExercises(userId: string, workoutName: string, workoutDescription: string, workoutExercises: Array<ExerciseSchemaType>) {
  try {
    const createWorkout = await db.routine.create({
      data: {
        userId,
        name: workoutName,
        description: workoutDescription,
        exercises: {
          create: workoutExercises,
        }
      },
      include: {
        exercises: {
          include: {
            exercise: true
          }
        }
      }
    });
    return createWorkout;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2011") {
        return error.message
      }
    }
    throw error
  };
}

export async function createWorkoutWithExercise() {
  try {
    const createWorkout = await db.routine.create({
      data: {
        name: "Random workout",
        description: "For those days when you're feeling random",
        // isFree: true,
        exercises: {
          create: [
            {
              exerciseId: "cly8yojji0005kyq4pdfm0v5f",
              orderInRoutine: 1
            },
          ],
        }
      },
      include: {
        exercises: {
          include: {
            exercise: true
          }
        }
      }
    });
    return createWorkout;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2011") {
        return error.message
      }
    }
    throw error
  };
};

export async function deleteWorkout(workoutId: string) {
  try {
    const deletedWorkout = await db.routine.delete({
      where: {
        id: workoutId,
      }
    })
    return deletedWorkout
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return error.message
      }
    }
    throw error
  };
};
