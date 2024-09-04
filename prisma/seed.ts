import { BalanceLevel, BalanceType, BodyFocus, ContractionType, Equipment, Joint, LiftType, MovementPattern, MovementPlane, MuscleGroup, PrismaClient, Role } from "@prisma/client";
const db = new PrismaClient();

function createUser() {
  return db.user.create({
    data: {
      role: Role.user,
      email: "test@email.com",
      firstName: "Marikusu",
      lastName: "Kiriburu"
    }
  })
}

function getCoaches() {
  return [
    {
      name: "Mark"
    },
    {
      name: "Rae"
    }
  ]
}

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
    {
      name: "Half Kneel Kettlebell Press",
      description: "An upper body compound press exercise that uses a single kettlebell as the load",
      tags: ["functional", "stability"],
      cues: [
        "1. Start in a half-kneeling position with one knee down and the other foot forward. Hold the kettlebell in the hand opposite the down knee, racked at the shoulder.",
        "2. Brace your core and keep elbow pinned to side.",
        "3. Press the kettlebell overhead until your arm is straight. Lower the kettlebell with control back to the starting position."
      ],
      tips: [
        "Breath in before the rep and exhale as you press",
        "Avoid winging your elbow during the press",
        "Avoid leaning back or to the side during the press"
      ],
      balance: BalanceType.unilateral,
      balanceLevel: BalanceLevel.static,
      body: [BodyFocus.upper, BodyFocus.core],
      contraction: ContractionType.isotonic,
      equipment: [Equipment.kettlebell],
      joint: [Joint.shoulder, Joint.elbow, Joint.wrist],
      lift: LiftType.compound,
      muscles: [MuscleGroup.shoulders, MuscleGroup.triceps, MuscleGroup.serratus],
      pattern: [MovementPattern.push],
      plane: [MovementPlane.sagittal, MovementPlane.frontal],
    },
    {
      name: "Kettlebell Single Leg Deadlift",
      description: "A lower body compound hinge exercise that requires single leg balance",
      tags: ["functional", "stability", "sldl", "balance"],
      cues: [
        "1. Hold the kettlebell in one hand and stand with a staggered stance",
        "2. Lower the kettlebell and hinge your hips",
        "3. Drive through the floor to return to starting position"
      ],
      tips: [
        "Maintain a lengthened spine",
        "Breathe in as you lower and exhale as you stand",
      ],
      balance: BalanceType.unilateral,
      balanceLevel: BalanceLevel.dynamic,
      body: [BodyFocus.lower, BodyFocus.core],
      contraction: ContractionType.isotonic,
      equipment: [Equipment.kettlebell],
      joint: [Joint.ankle, Joint.knee, Joint.hip],
      lift: LiftType.compound,
      muscles: [MuscleGroup.glutes, MuscleGroup.hamstrings, MuscleGroup.adductors, MuscleGroup.obliques, MuscleGroup.lats],
      pattern: [MovementPattern.hinge, MovementPattern.rotational],
      plane: [MovementPlane.sagittal, MovementPlane.frontal],
    },
    {
      name: "Kettlebell Renegade Row",
      description: "A full body stability and strength exercise that combines the plank and row",
      tags: ["functional", "stability", "renegade"],
      cues: [
        "1. Hold the kettlebell in one hand and stand with a staggered stance",
        "2. Lower the kettlebell and hinge your hips",
        "3. Drive through the floor to return to starting position"
      ],
      tips: [
        "Maintain a lengthened spine",
        "Breathe in as you lower and exhale as you stand",
      ],
      balance: BalanceType.unilateral,
      balanceLevel: BalanceLevel.dynamic,
      body: [BodyFocus.full, BodyFocus.core, BodyFocus.upper],
      contraction: ContractionType.isotonic,
      equipment: [Equipment.kettlebell],
      joint: [Joint.shoulder, Joint.elbow, Joint.wrist, Joint.ankle],
      lift: LiftType.compound,
      muscles: [MuscleGroup.serratus, MuscleGroup.obliques, MuscleGroup.lats, MuscleGroup.erectors, MuscleGroup.abs],
      pattern: [MovementPattern.pull, MovementPattern.rotational],
      plane: [MovementPlane.sagittal, MovementPlane.transverse],
    },
    {
      name: "Kettlebell Swing",
      description: "A full body power exercise ",
      tags: ["functional", "power", "jump", "athletic", "speed", "booty"],
      cues: [
        "1. Hold the kettlebell in one hand and stand with a staggered stance",
        "2. Lower the kettlebell and hinge your hips",
        "3. Drive through the floor to return to starting position"
      ],
      tips: [
        "A progression of the kettlebell sumo deadlift",
        "The kettlebell drive mimics jumping",
        "Keep arms and shoulders relaxed throughout the motion",
      ],
      balance: BalanceType.bilateral,
      balanceLevel: BalanceLevel.static,
      body: [BodyFocus.lower, BodyFocus.core, BodyFocus.full],
      contraction: ContractionType.isotonic,
      equipment: [Equipment.kettlebell],
      joint: [Joint.ankle, Joint.knee, Joint.hip],
      lift: LiftType.compound,
      muscles: [MuscleGroup.glutes, MuscleGroup.hamstrings, MuscleGroup.lats, MuscleGroup.erectors, MuscleGroup.abs],
      pattern: [MovementPattern.hinge, MovementPattern.core],
      plane: [MovementPlane.sagittal],
    },
  ];
};

async function seed() {
  await createUser();
  await Promise.all([
    ...getKettlebellExercises().map((exercise) => db.exercise.create({ data: exercise })),
    ...getCoaches().map((coach) => db.coach.create({ data: coach })),
  ]);
};

seed();