import { Prisma, ExerciseTarget, Side, LoadUnit, Exercise, } from "@prisma/client";
import db from "~/db.server";
import { getAllExercises } from "./exercise.server";

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
  orderInRoutine: number;
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

export function getWorkoutWithExercises(workoutId: string) {
  return db.routine.findUnique({
    where: {
      id: workoutId
    },
    include: {
      exercises: true,
    },
  })
}

export function getAllWorkouts(query: string | null) {
  return db.routine.findMany({
    where: {
      name: {
        contains: query || "",
        mode: "insensitive",
      },
      isFree: true,
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
      exercises: {
        include: {
          exercise: {
            select: {
              muxPlaybackId: true,
            }
          }
        }
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
    const exercises = await getAllExercises(null)
    const createWorkout = await db.routine.create({
      data: {
        name: "Full body sampler",
        description: "A full body workout that incorporates all planes of movement",
        isFree: true,
        exercises: {
          create: [
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "vBU0063pFAXYUcfeQiPWJokcLFaC4jh8KU8PFtrQsiYI")?.id as string, // 90 / 90 stretch
              orderInRoutine: 1,
              target: ExerciseTarget.reps,
              sets: "1",
              reps: "5",
              rest: "None",
              time: "3",
              notes: "5 reps per side, 3 sec exhale",
              side: null,
              circuitId: null,
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "N602azha2Y3XjCw4QkJcbrGH6TzIYS02ZE2PegWcsvN00g")?.id as string, // leg lowering
              orderInRoutine: 2,
              target: ExerciseTarget.reps,
              sets: "1",
              reps: "5",
              rest: "None",
              time: "3",
              notes: "5 reps per side, 3 sec exhale",
              side: null,
              circuitId: null,
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "5a5ziapKMdlI01rLQqzA3f93Fo1xrpHIkR02g8GCGq1008")?.id as string, // v stance
              orderInRoutine: 3,
              target: ExerciseTarget.reps,
              sets: "1",
              reps: "5",
              rest: "None",
              time: "3",
              notes: "5 reps per side, 3 sec exhale",
              side: null,
              circuitId: null,
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "7BLwcXxbceIsniBtbdThz3blTZG1i2lftuOATmOu7ms")?.id as string, // sldl
              orderInRoutine: 4,
              target: ExerciseTarget.reps,
              sets: "1",
              reps: "5",
              rest: "None",
              time: "3",
              notes: "5 reps per side, 3 sec exhale",
              side: null,
              circuitId: null,
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "s628Twytob5ynbDKqKoNMiLHvMG2ZyTauK02vuV5texM")?.id as string, // split squat
              orderInRoutine: 5,
              target: ExerciseTarget.time,
              sets: "3",
              reps: null,
              rest: "90 sec",
              time: "30 sec",
              notes: "30 sec per leg",
              side: null,
              circuitId: 'circuit-1732317444526',
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "TU4XmFZXrsRuP5pI4kPLFV7rGuOijeFqZF2vt01983O8")?.id as string, // half kneel press
              orderInRoutine: 6,
              target: ExerciseTarget.reps,
              sets: "3",
              reps: "8",
              rest: "90 sec",
              time: null,
              notes: "8 reps per side",
              side: null,
              circuitId: 'circuit-1732317444526',
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "tG1R00di01E02CnddXquQQilFpRlSqLg55aw4niXIOvkxA")?.id as string, // palloff
              orderInRoutine: 7,
              target: ExerciseTarget.reps,
              sets: "3",
              reps: "12",
              rest: "90 sec",
              time: null,
              notes: "12 reps per side",
              side: null,
              circuitId: 'circuit-1732317444526',
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "8HlOIpUPa2ur6pzng0102iYzBDRRWA9omKjkm10200sPPAo")?.id as string, // lateral lunge
              orderInRoutine: 8,
              target: ExerciseTarget.reps,
              sets: "4",
              reps: "8",
              rest: "60 sec",
              time: null,
              notes: "alternate sides each rep for 16 total reps",
              side: null,
              circuitId: 'circuit-1732317664252',
            },
            {
              exerciseId: exercises.find((exercise: Exercise) => exercise.muxPlaybackId === "yNTTTsacFF9K4vf02QwlFn7RWZDStq3T00hwrmnqw5cF4")?.id as string, // suspension
              orderInRoutine: 9,
              target: ExerciseTarget.reps,
              sets: "4",
              reps: "10",
              rest: "60 sec",
              time: null,
              notes: null,
              side: null,
              circuitId: 'circuit-1732317664252',
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
