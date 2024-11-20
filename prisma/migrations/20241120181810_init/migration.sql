-- CreateEnum
CREATE TYPE "AppointmentType" AS ENUM ('GOAL_SETTING', 'FOLLOWUP');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "BalanceType" AS ENUM ('bilateral', 'unilateral');

-- CreateEnum
CREATE TYPE "BalanceLevel" AS ENUM ('static', 'dynamic');

-- CreateEnum
CREATE TYPE "BodyFocus" AS ENUM ('upper', 'lower', 'core', 'full');

-- CreateEnum
CREATE TYPE "ContractionType" AS ENUM ('isometric', 'isotonic');

-- CreateEnum
CREATE TYPE "Equipment" AS ENUM ('bodyweight', 'dumbbell', 'kettlebell', 'barbell', 'resistance_band', 'suspension', 'parallette', 'slider_discs', 'gymnastics_rings', 'foam_roller', 'medicine_ball', 'sled', 'bike', 'plyo_box', 'bench', 'cable_machine');

-- CreateEnum
CREATE TYPE "Joint" AS ENUM ('ankle', 'knee', 'hip', 'shoulder', 'elbow', 'wrist');

-- CreateEnum
CREATE TYPE "LiftType" AS ENUM ('compound', 'isolation');

-- CreateEnum
CREATE TYPE "LoadUnit" AS ENUM ('bodyweight', 'kilogram', 'pound');

-- CreateEnum
CREATE TYPE "MuscleGroup" AS ENUM ('quads', 'hamstrings', 'glutes', 'calves', 'shoulders', 'biceps', 'triceps', 'forearms', 'pecs', 'lats', 'traps', 'hip_flexors', 'erectors', 'adductors', 'abductors', 'abs', 'obliques', 'serratus', 'pelvic_floor');

-- CreateEnum
CREATE TYPE "MovementPattern" AS ENUM ('push', 'pull', 'core', 'squat', 'hinge', 'lunge', 'rotational', 'locomotive');

-- CreateEnum
CREATE TYPE "MovementPlane" AS ENUM ('frontal', 'sagittal', 'transverse');

-- CreateEnum
CREATE TYPE "StretchType" AS ENUM ('static', 'dynamic');

-- CreateEnum
CREATE TYPE "SectionType" AS ENUM ('warmup', 'main', 'cooldown');

-- CreateEnum
CREATE TYPE "GroupType" AS ENUM ('circuit', 'regular');

-- CreateEnum
CREATE TYPE "ExerciseTarget" AS ENUM ('reps', 'time');

-- CreateEnum
CREATE TYPE "Side" AS ENUM ('left', 'right', 'none');

-- CreateEnum
CREATE TYPE "Recurrence" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "profilePhotoUrl" TEXT,
    "profilePhotoId" TEXT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "role" "Role" NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FitnessProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "unit" "LoadUnit" NOT NULL DEFAULT 'pound',
    "currentWeight" INTEGER,
    "targetWeight" INTEGER,
    "goal_fatLoss" BOOLEAN,
    "goal_endurance" BOOLEAN,
    "goal_buildMuscle" BOOLEAN,
    "goal_loseWeight" BOOLEAN,
    "goal_improveBalance" BOOLEAN,
    "goal_improveFlexibility" BOOLEAN,
    "goal_learnNewSkills" BOOLEAN,
    "parq_heartCondition" BOOLEAN,
    "parq_chestPainActivity" BOOLEAN,
    "parq_chestPainNoActivity" BOOLEAN,
    "parq_balanceConsciousness" BOOLEAN,
    "parq_boneJoint" BOOLEAN,
    "parq_bloodPressureMeds" BOOLEAN,
    "parq_otherReasons" BOOLEAN,
    "operational_occupation" TEXT,
    "operational_extendedSitting" BOOLEAN,
    "operational_repetitiveMovements" BOOLEAN,
    "operational_explanation_repetitiveMovements" TEXT,
    "operational_heelShoes" BOOLEAN,
    "operational_mentalStress" BOOLEAN,
    "recreational_physicalActivities" BOOLEAN,
    "recreational_explanation_physicalActivities" TEXT,
    "recreational_hobbies" BOOLEAN,
    "recreational_explanation_hobbies" TEXT,
    "medical_injuriesPain" BOOLEAN,
    "medical_explanation_injuriesPain" TEXT,
    "medical_surgeries" BOOLEAN,
    "medical_explanation_surgeries" TEXT,
    "medical_chronicDisease" BOOLEAN,
    "medical_explanation_chronicDisease" TEXT,
    "medical_medications" BOOLEAN,
    "medical_explanation_medications" TEXT,

    CONSTRAINT "FitnessProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SocialLogin" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerUserId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "SocialLogin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "description" TEXT,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),

    CONSTRAINT "UserSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "price" DECIMAL(65,30),
    "youtubeLink" TEXT,
    "s3ImageKey" TEXT,
    "s3VideoKey" TEXT,
    "muxPlaybackId" TEXT,
    "userId" TEXT,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Routine" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isFree" BOOLEAN DEFAULT false,
    "youtubeLink" TEXT,
    "s3ImageKey" TEXT,
    "s3VideoKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "Routine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramWeek" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "weekNumber" INTEGER NOT NULL,

    CONSTRAINT "ProgramWeek_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramDay" (
    "id" TEXT NOT NULL,
    "programWeekId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "movementPrepId" TEXT NOT NULL,
    "warmupId" TEXT NOT NULL,
    "cooldownId" TEXT NOT NULL,

    CONSTRAINT "ProgramDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramBlock" (
    "id" TEXT NOT NULL,
    "programDayId" TEXT NOT NULL,
    "blockNumber" INTEGER NOT NULL,

    CONSTRAINT "ProgramBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramRoutine" (
    "programId" TEXT NOT NULL,
    "routineId" TEXT NOT NULL,

    CONSTRAINT "ProgramRoutine_pkey" PRIMARY KEY ("programId","routineId")
);

-- CreateTable
CREATE TABLE "MovementPrep" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "MovementPrep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FoamRollingExercise" (
    "movementPrepId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "reps" INTEGER NOT NULL,
    "time" INTEGER,

    CONSTRAINT "FoamRollingExercise_pkey" PRIMARY KEY ("movementPrepId","exerciseId")
);

-- CreateTable
CREATE TABLE "MobilityExercise" (
    "movementPrepId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "reps" INTEGER NOT NULL,
    "time" INTEGER,

    CONSTRAINT "MobilityExercise_pkey" PRIMARY KEY ("movementPrepId","exerciseId")
);

-- CreateTable
CREATE TABLE "ActivationExercise" (
    "movementPrepId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "reps" INTEGER NOT NULL,
    "time" INTEGER,

    CONSTRAINT "ActivationExercise_pkey" PRIMARY KEY ("movementPrepId","exerciseId")
);

-- CreateTable
CREATE TABLE "Warmup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Warmup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DynamicExercise" (
    "warmupId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "reps" INTEGER NOT NULL,

    CONSTRAINT "DynamicExercise_pkey" PRIMARY KEY ("warmupId","exerciseId")
);

-- CreateTable
CREATE TABLE "LadderExercise" (
    "warmupId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "reps" INTEGER NOT NULL,

    CONSTRAINT "LadderExercise_pkey" PRIMARY KEY ("warmupId","exerciseId")
);

-- CreateTable
CREATE TABLE "PowerExercise" (
    "warmupId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "reps" INTEGER NOT NULL,

    CONSTRAINT "PowerExercise_pkey" PRIMARY KEY ("warmupId","exerciseId")
);

-- CreateTable
CREATE TABLE "Cooldown" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Cooldown_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CooldownExercise" (
    "cooldownId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "reps" INTEGER,
    "time" INTEGER,

    CONSTRAINT "CooldownExercise_pkey" PRIMARY KEY ("cooldownId","exerciseId")
);

-- CreateTable
CREATE TABLE "Exercise" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isFree" BOOLEAN NOT NULL DEFAULT false,
    "cues" TEXT[],
    "tips" TEXT[],
    "youtubeLink" TEXT,
    "s3ImageKey" TEXT,
    "s3VideoKey" TEXT,
    "muxPlaybackId" TEXT,
    "tags" TEXT[],
    "balance" "BalanceType",
    "balanceLevel" "BalanceLevel",
    "body" "BodyFocus"[],
    "contraction" "ContractionType",
    "equipment" "Equipment"[],
    "joint" "Joint"[],
    "lift" "LiftType",
    "muscles" "MuscleGroup"[],
    "pattern" "MovementPattern"[],
    "plane" "MovementPlane"[],
    "stretch" "StretchType",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineExercise" (
    "routineId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "orderInRoutine" INTEGER NOT NULL,
    "circuitId" TEXT,
    "sets" TEXT,
    "target" "ExerciseTarget" NOT NULL,
    "reps" TEXT,
    "time" TEXT,
    "notes" TEXT,
    "rest" TEXT NOT NULL,
    "side" "Side",

    CONSTRAINT "RoutineExercise_pkey" PRIMARY KEY ("routineId","exerciseId")
);

-- CreateTable
CREATE TABLE "BlockExercise" (
    "programBlockId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "orderInBlock" INTEGER NOT NULL,
    "sets" INTEGER,
    "target" "ExerciseTarget" NOT NULL,
    "reps" INTEGER,
    "time" INTEGER,
    "notes" TEXT,
    "rest" INTEGER,
    "side" "Side",

    CONSTRAINT "BlockExercise_pkey" PRIMARY KEY ("programBlockId","exerciseId")
);

-- CreateTable
CREATE TABLE "ProgramLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "programWeek" INTEGER NOT NULL DEFAULT 1,
    "programDay" INTEGER NOT NULL DEFAULT 1,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" TEXT NOT NULL,

    CONSTRAINT "ProgramLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramExerciseLog" (
    "id" TEXT NOT NULL,
    "programLogId" TEXT NOT NULL,
    "programBlockId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,

    CONSTRAINT "ProgramExerciseLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProgramExerciseLogSet" (
    "id" TEXT NOT NULL,
    "programExerciseLogId" TEXT NOT NULL,
    "set" TEXT NOT NULL,
    "actualReps" TEXT,
    "load" DOUBLE PRECISION,
    "notes" TEXT,
    "unit" "LoadUnit" NOT NULL DEFAULT 'pound',

    CONSTRAINT "ProgramExerciseLogSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "routineId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" TEXT NOT NULL,

    CONSTRAINT "WorkoutLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseLog" (
    "id" TEXT NOT NULL,
    "workoutLogId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "circuitId" TEXT,
    "orderInRoutine" INTEGER NOT NULL,
    "target" "ExerciseTarget" NOT NULL,
    "time" TEXT,
    "targetReps" TEXT,

    CONSTRAINT "ExerciseLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseLogSet" (
    "id" TEXT NOT NULL,
    "exerciseLogId" TEXT NOT NULL,
    "set" TEXT NOT NULL,
    "actualReps" TEXT,
    "load" DOUBLE PRECISION,
    "notes" TEXT,
    "unit" "LoadUnit" NOT NULL DEFAULT 'pound',

    CONSTRAINT "ExerciseLogSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "routineId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "recurrence" "Recurrence",

    CONSTRAINT "WorkoutSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coach" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Coach_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Availability" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Availability_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3) NOT NULL,
    "type" "AppointmentType" NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Leaderboard" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "routineId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Leaderboard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FitnessProfile_userId_key" ON "FitnessProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialLogin_provider_providerUserId_key" ON "SocialLogin"("provider", "providerUserId");

-- AddForeignKey
ALTER TABLE "FitnessProfile" ADD CONSTRAINT "FitnessProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialLogin" ADD CONSTRAINT "SocialLogin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Routine" ADD CONSTRAINT "Routine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramWeek" ADD CONSTRAINT "ProgramWeek_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramDay" ADD CONSTRAINT "ProgramDay_programWeekId_fkey" FOREIGN KEY ("programWeekId") REFERENCES "ProgramWeek"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramDay" ADD CONSTRAINT "ProgramDay_movementPrepId_fkey" FOREIGN KEY ("movementPrepId") REFERENCES "MovementPrep"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramDay" ADD CONSTRAINT "ProgramDay_warmupId_fkey" FOREIGN KEY ("warmupId") REFERENCES "Warmup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramDay" ADD CONSTRAINT "ProgramDay_cooldownId_fkey" FOREIGN KEY ("cooldownId") REFERENCES "Cooldown"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramBlock" ADD CONSTRAINT "ProgramBlock_programDayId_fkey" FOREIGN KEY ("programDayId") REFERENCES "ProgramDay"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramRoutine" ADD CONSTRAINT "ProgramRoutine_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramRoutine" ADD CONSTRAINT "ProgramRoutine_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoamRollingExercise" ADD CONSTRAINT "FoamRollingExercise_movementPrepId_fkey" FOREIGN KEY ("movementPrepId") REFERENCES "MovementPrep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FoamRollingExercise" ADD CONSTRAINT "FoamRollingExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MobilityExercise" ADD CONSTRAINT "MobilityExercise_movementPrepId_fkey" FOREIGN KEY ("movementPrepId") REFERENCES "MovementPrep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MobilityExercise" ADD CONSTRAINT "MobilityExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivationExercise" ADD CONSTRAINT "ActivationExercise_movementPrepId_fkey" FOREIGN KEY ("movementPrepId") REFERENCES "MovementPrep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ActivationExercise" ADD CONSTRAINT "ActivationExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DynamicExercise" ADD CONSTRAINT "DynamicExercise_warmupId_fkey" FOREIGN KEY ("warmupId") REFERENCES "Warmup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DynamicExercise" ADD CONSTRAINT "DynamicExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LadderExercise" ADD CONSTRAINT "LadderExercise_warmupId_fkey" FOREIGN KEY ("warmupId") REFERENCES "Warmup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LadderExercise" ADD CONSTRAINT "LadderExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PowerExercise" ADD CONSTRAINT "PowerExercise_warmupId_fkey" FOREIGN KEY ("warmupId") REFERENCES "Warmup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PowerExercise" ADD CONSTRAINT "PowerExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooldownExercise" ADD CONSTRAINT "CooldownExercise_cooldownId_fkey" FOREIGN KEY ("cooldownId") REFERENCES "Cooldown"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CooldownExercise" ADD CONSTRAINT "CooldownExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineExercise" ADD CONSTRAINT "RoutineExercise_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoutineExercise" ADD CONSTRAINT "RoutineExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockExercise" ADD CONSTRAINT "BlockExercise_programBlockId_fkey" FOREIGN KEY ("programBlockId") REFERENCES "ProgramBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlockExercise" ADD CONSTRAINT "BlockExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramLog" ADD CONSTRAINT "ProgramLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramLog" ADD CONSTRAINT "ProgramLog_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramExerciseLog" ADD CONSTRAINT "ProgramExerciseLog_programLogId_fkey" FOREIGN KEY ("programLogId") REFERENCES "ProgramLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramExerciseLog" ADD CONSTRAINT "ProgramExerciseLog_programBlockId_exerciseId_fkey" FOREIGN KEY ("programBlockId", "exerciseId") REFERENCES "BlockExercise"("programBlockId", "exerciseId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProgramExerciseLogSet" ADD CONSTRAINT "ProgramExerciseLogSet_programExerciseLogId_fkey" FOREIGN KEY ("programExerciseLogId") REFERENCES "ProgramExerciseLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutLog" ADD CONSTRAINT "WorkoutLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutLog" ADD CONSTRAINT "WorkoutLog_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseLog" ADD CONSTRAINT "ExerciseLog_workoutLogId_fkey" FOREIGN KEY ("workoutLogId") REFERENCES "WorkoutLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseLog" ADD CONSTRAINT "ExerciseLog_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseLogSet" ADD CONSTRAINT "ExerciseLogSet_exerciseLogId_fkey" FOREIGN KEY ("exerciseLogId") REFERENCES "ExerciseLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Availability" ADD CONSTRAINT "Availability_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "Coach"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leaderboard" ADD CONSTRAINT "Leaderboard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Leaderboard" ADD CONSTRAINT "Leaderboard_routineId_fkey" FOREIGN KEY ("routineId") REFERENCES "Routine"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
