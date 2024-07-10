import { Prisma, SectionType } from "@prisma/client";
import db from "~/db.server";

export type ExerciseSchemaType = {
  exerciseId: string
  orderInRoutine: number
  section: SectionType
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

export async function createWorkoutWithExercises(workoutName: string, workoutDescription: string, workoutExercises: Array<ExerciseSchemaType>) {
  try {
    const createWorkout = await db.routine.create({
      data: {
        name: workoutName,
        description: workoutDescription,
        isFree: true,
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
        isFree: true,
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
