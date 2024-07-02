import { BalanceLevel, BalanceType, BodyFocus, ContractionType, Equipment, Joint, LiftType, MovementPattern, MovementPlane, MuscleGroup, PrismaClient } from "@prisma/client";
const db = new PrismaClient();

function getKettlebellExercises() {
  return [
    {
      name: "Kettlebell Goblet Squat",
      description: "A lower body compound squat exercise that uses a single kettlebell as the load",
      tags: ["deep squat", "goblet", "functional"],
      cues: [
        "1. Hold the kettlebell to your chest with your elbows in",
        "2. Stand with feet about hip width apart with toes slightly pointed outwards",
        "3. Lower like you are sitting on a small chair below you, then drive through the feet to stand"
      ],
      tips: [
        "Breath in as you descend, exhale as you ascend",
        "Keep your elbows pinned to your sides throughout the descent and ascent",
        "Keep knees pushed out and chest up throughout the movement"
      ],
      balance: BalanceType.bilateral,
      balanceLevel: BalanceLevel.static,
      body: [BodyFocus.lower],
      contraction: ContractionType.isotonic,
      equipment: [Equipment.kettlebell],
      joint: [Joint.ankle, Joint.knee, Joint.hip],
      lift: LiftType.compound,
      muscles: [MuscleGroup.glutes, MuscleGroup.hamstrings, MuscleGroup.quads, MuscleGroup.erectors],
      pattern: [MovementPattern.squat],
      plane: [MovementPlane.sagittal],
    },
    {
      name: "Kettlebell Sumo Deadlift",
      description: "A lower body compound hinge exercise that uses a single kettlebell as the load",
      tags: ["functional", "booty"],
      cues: [
        "1. Stand with feet slightly wider than hip width directly over kettlebell",
        "2. Lower by pushing your hips back and grip the kettlebell tight",
        "3. Drive through the feet to stand, push hips back to lower"
      ],
      tips: [
        "Breath in as you descend, exhale as you ascend",
        "Keep good posture throughout the movement: think shoulders back and chest out",
        "Keep knees pushed out and chest up throughout the movement"
      ],
      balance: BalanceType.bilateral,
      balanceLevel: BalanceLevel.static,
      body: [BodyFocus.lower],
      contraction: ContractionType.isotonic,
      equipment: [Equipment.kettlebell],
      joint: [Joint.ankle, Joint.knee, Joint.hip],
      lift: LiftType.compound,
      muscles: [MuscleGroup.glutes, MuscleGroup.hamstrings, MuscleGroup.erectors, MuscleGroup.lats],
      pattern: [MovementPattern.hinge],
      plane: [MovementPlane.sagittal],
    },
  ];
};

async function seed() {
  await Promise.all(
    getKettlebellExercises().map((exercise) => db.exercise.create({ data: exercise }))
  );
};

seed();