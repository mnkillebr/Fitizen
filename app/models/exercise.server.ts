import { BalanceLevel, BalanceType, BodyFocus, ContractionType, Equipment, Joint, LiftType, MovementPattern, MovementPlane, MuscleGroup, Prisma } from "@prisma/client";
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
  // return db.exercise.create({
  //   data: {
  //     name: "Pushup",
  //     description: "An full body strength exercise that targets chest and core",
  //     tags: ["chest", "core", "calisthenics"],
  //     cues: [
  //       "Start in a high plank position with your hands slightly wider than shoulder-width apart. Your body should form a straight line from your head to your heels, with your core engaged and your glutes tight. Keep your shoulders directly above your wrists, and your feet together or hip-width apart, depending on your stability.",
  //       "Lower your body by bending your elbows, keeping them at a 45-degree angle from your body (not flaring out to the sides). Your chest should lower toward the floor while maintaining a straight line from your head to your heels. Keep your core braced to prevent your hips from sagging or rising too high.",
  //       "Push through your hands to return to the starting position, fully extending your arms. You should feel this in your chest, shoulders, triceps, and core. Focus on maintaining a tight plank throughout the movement, avoiding any arching in your lower back or letting your hips drop. Maintain control on the way down and up."
  //     ],
  //     balance: BalanceType.bilateral,
  //     balanceLevel: BalanceLevel.static,
  //     body: [BodyFocus.upper, BodyFocus.core],
  //     contraction: ContractionType.isotonic,
  //     equipment: [Equipment.bodyweight],
  //     joint: [Joint.ankle, Joint.shoulder, Joint.wrist, Joint.elbow],
  //     lift: LiftType.compound,
  //     muscles: [MuscleGroup.pecs, MuscleGroup.triceps, MuscleGroup.shoulders, MuscleGroup.abs, MuscleGroup.erectors],
  //     pattern: [MovementPattern.push, MovementPattern.core],
  //     plane: [MovementPlane.sagittal],
  //   },
  // });
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
