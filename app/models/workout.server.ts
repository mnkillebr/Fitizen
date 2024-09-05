import { Prisma, ExerciseTarget, Side, LoadUnit, } from "@prisma/client";
import db from "~/db.server";

export type ExerciseSchemaType = {
  exerciseId: string;
  orderInRoutine: number;
  target: ExerciseTarget;
  sets: string;
  reps: string;
  notes: string;
  time: string;
  rest: string;
  side: Side;
  circuitId: string;
}

export type ExerciseLogSet = {
  set: string;
  actualReps?: string;
  load?: number;
  unit: LoadUnit;
  notes?: string;
}
export type ExerciseLogType = {
  exerciseId: string;
  circuitId?: string;
  target: ExerciseTarget;
  time?: string;
  targetReps?: string;
  sets: ExerciseLogSet[];
  // set: string;
  // actualReps?: string;
  // load?: number;
  // unit: LoadUnit;
  // notes?: string;
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

export function getAllUserWorkoutNames(userId: string) {
  return db.routine.findMany({
    where: {
      OR: [
        {
          userId,
        },
        {
          isFree: true,
        }
      ],
    },
    select: {
      id: true,
      name: true,
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

export async function updateUserWorkoutWithExercises(userId: string, workoutId: string, workoutName: string, workoutDescription: string, updatedExercises: Array<ExerciseSchemaType>, newExercises: Array<ExerciseSchemaType>, deletedExercises: Array<string>) {
  try {
    const updateWorkout = await db.routine.update({
      where: {
        id: workoutId,
      },
      data: {
        userId,
        name: workoutName,
        description: workoutDescription,
        exercises: {
          update: updatedExercises.map(exercise => ({
            where: {
              routineId_exerciseId: {
                exerciseId: exercise.exerciseId,
                routineId: workoutId,
              }
            },
            data: {
              orderInRoutine: exercise.orderInRoutine,
              target: exercise.target === "reps" ? ExerciseTarget.reps : ExerciseTarget.time,
              sets: exercise.sets,
              reps: exercise.reps,
              rest: exercise.rest,
              notes: exercise.notes,
              side: exercise.side === "left" ? Side.left : exercise.side === "right" ? Side.right : Side.none,
              time: exercise.time,
              circuitId: exercise.circuitId,
            },
          })),
          create: newExercises,
          delete: deletedExercises.map(exerciseId => ({ routineId_exerciseId: {
            exerciseId,
            routineId: workoutId,
          }}))
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
    return updateWorkout;
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
              exerciseId: "clzuebrd300045brturmk9bcf",
              orderInRoutine: 1,
              target: ExerciseTarget.reps,
              sets: "3",
              reps: "12",
              rest: "60 sec",
              notes: null,
              side: null,
              circuitId: null,
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
      if (error.code === "P2003") {
        return error.message
      }
    }
    throw error
  };
};

export async function saveUserWorkoutLog(userId: string, routineId: string, duration: string, exerciseLogs: Array<ExerciseLogType>) {
  try {
    const createUserWorkoutLog = await db.workoutLog.create({
      data: {
        // id: "clzk74lr30003yuzz0acb1sp3",
        userId,
        routineId,
        duration,
        exerciseLogs: {
          create: exerciseLogs.map(exercise => ({
            ...exercise,
            sets: {
              create: exercise.sets,
            }
          })),
          // create: exerciseLogs,
        },
      },
      include: {
        exerciseLogs: true
      },
    })
    return createUserWorkoutLog;
  } catch (error) {
    console.error('Error creating WorkoutLog with exercise logs:', error);
    // if (error instanceof Prisma.PrismaClientKnownRequestError) {
    //   return error.message
    // }
    throw error
  };
}

export function getWorkoutLogsById(userId: string, routineId: string) {
  return db.workoutLog.findMany({
    where: {
      userId,
      routineId,
    }
  })
}
