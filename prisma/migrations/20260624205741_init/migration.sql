-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "StudentObjective" AS ENUM ('WEIGHT_LOSS', 'HYPERTROPHY', 'CONDITIONING', 'REHABILITATION', 'PERFORMANCE');

-- CreateEnum
CREATE TYPE "StudentStatus" AS ENUM ('ACTIVE', 'PAUSED', 'INACTIVE');

-- CreateEnum
CREATE TYPE "MuscleGroup" AS ENUM ('CHEST', 'BACK', 'SHOULDERS', 'BICEPS', 'TRICEPS', 'QUADRICEPS', 'HAMSTRINGS', 'CALVES', 'GLUTES', 'ABS');

-- CreateEnum
CREATE TYPE "DifficultyLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "WorkoutDivision" AS ENUM ('A', 'B', 'C', 'D', 'E', 'F');

-- CreateEnum
CREATE TYPE "CommentType" AS ENUM ('OBSERVATION', 'FEEDBACK', 'INJURY', 'ADAPTATION', 'DISCOMFORT');

-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('WEIGHT', 'BODY_FAT', 'MUSCLE_MASS', 'CIRCUMFERENCE');

-- CreateEnum
CREATE TYPE "ScheduleEventType" AS ENUM ('EVALUATION', 'WORKOUT_RENEWAL', 'CONSULTATION', 'AVAILABILITY');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('EXPIRED_EVALUATION', 'EXPIRED_WORKOUT', 'NO_UPDATE', 'BIRTHDAY', 'PLAN_RENEWAL');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "photoUrl" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "sex" "Sex",
    "height" DOUBLE PRECISION,
    "weight" DOUBLE PRECISION,
    "phone" TEXT,
    "email" TEXT,
    "passwordHash" TEXT,
    "objective" "StudentObjective",
    "observations" TEXT,
    "physicalRestrictions" TEXT,
    "pathologies" TEXT,
    "medications" TEXT,
    "status" "StudentStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anamneses" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "mainObjective" TEXT,
    "weightTrainingExperience" TEXT,
    "weeklyFrequency" INTEGER,
    "healthIssues" TEXT,
    "injuries" TEXT,
    "previousSurgeries" TEXT,
    "medications" TEXT,
    "dietaryRestrictions" TEXT,
    "sleepHours" INTEGER,
    "stressLevel" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "anamneses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT,
    "name" TEXT NOT NULL,
    "muscleGroup" "MuscleGroup" NOT NULL,
    "imageUrl" TEXT,
    "videoUrl" TEXT,
    "equipment" TEXT,
    "difficultyLevel" "DifficultyLevel",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workouts" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "division" "WorkoutDivision" NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_exercises" (
    "id" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" TEXT NOT NULL,
    "restTime" INTEGER,
    "load" DOUBLE PRECISION,
    "observations" TEXT,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workout_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_history" (
    "id" TEXT NOT NULL,
    "workoutId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "snapshot" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workout_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "physical_evaluations" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "weight" DOUBLE PRECISION,
    "height" DOUBLE PRECISION,
    "bmi" DOUBLE PRECISION,
    "bodyFatPercentage" DOUBLE PRECISION,
    "leanMass" DOUBLE PRECISION,
    "muscleMass" DOUBLE PRECISION,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "physical_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "body_measurements" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "shoulder" DOUBLE PRECISION,
    "chest" DOUBLE PRECISION,
    "waist" DOUBLE PRECISION,
    "abdomen" DOUBLE PRECISION,
    "hip" DOUBLE PRECISION,
    "rightArm" DOUBLE PRECISION,
    "leftArm" DOUBLE PRECISION,
    "rightThigh" DOUBLE PRECISION,
    "leftThigh" DOUBLE PRECISION,
    "rightCalf" DOUBLE PRECISION,
    "leftCalf" DOUBLE PRECISION,

    CONSTRAINT "body_measurements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evolution_photos" (
    "id" TEXT NOT NULL,
    "evaluationId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "frontUrl" TEXT,
    "backUrl" TEXT,
    "leftProfileUrl" TEXT,
    "rightProfileUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "evolution_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comments" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "CommentType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "goals" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "type" "GoalType" NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "currentValue" DOUBLE PRECISION,
    "deadline" TIMESTAMP(3),
    "achieved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_events" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "studentId" TEXT,
    "type" "ScheduleEventType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "schedule_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "studentId" TEXT,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weight_records" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weight_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "load_records" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "workoutExerciseId" TEXT NOT NULL,
    "load" DOUBLE PRECISION NOT NULL,
    "reps" INTEGER,
    "notes" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "load_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "students_trainerId_idx" ON "students"("trainerId");

-- CreateIndex
CREATE INDEX "students_status_idx" ON "students"("status");

-- CreateIndex
CREATE UNIQUE INDEX "anamneses_studentId_key" ON "anamneses"("studentId");

-- CreateIndex
CREATE INDEX "exercises_muscleGroup_idx" ON "exercises"("muscleGroup");

-- CreateIndex
CREATE INDEX "exercises_trainerId_idx" ON "exercises"("trainerId");

-- CreateIndex
CREATE INDEX "workouts_studentId_isActive_idx" ON "workouts"("studentId", "isActive");

-- CreateIndex
CREATE INDEX "workouts_trainerId_idx" ON "workouts"("trainerId");

-- CreateIndex
CREATE INDEX "workout_exercises_workoutId_order_idx" ON "workout_exercises"("workoutId", "order");

-- CreateIndex
CREATE INDEX "physical_evaluations_studentId_date_idx" ON "physical_evaluations"("studentId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "body_measurements_evaluationId_key" ON "body_measurements"("evaluationId");

-- CreateIndex
CREATE UNIQUE INDEX "evolution_photos_evaluationId_key" ON "evolution_photos"("evaluationId");

-- CreateIndex
CREATE INDEX "comments_studentId_createdAt_idx" ON "comments"("studentId", "createdAt");

-- CreateIndex
CREATE INDEX "schedule_events_trainerId_startAt_idx" ON "schedule_events"("trainerId", "startAt");

-- CreateIndex
CREATE INDEX "notifications_trainerId_read_idx" ON "notifications"("trainerId", "read");

-- CreateIndex
CREATE INDEX "weight_records_studentId_recordedAt_idx" ON "weight_records"("studentId", "recordedAt");

-- CreateIndex
CREATE INDEX "load_records_studentId_recordedAt_idx" ON "load_records"("studentId", "recordedAt");

-- CreateIndex
CREATE INDEX "payments_trainerId_status_idx" ON "payments"("trainerId", "status");

-- AddForeignKey
ALTER TABLE "students" ADD CONSTRAINT "students_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anamneses" ADD CONSTRAINT "anamneses_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workouts" ADD CONSTRAINT "workouts_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_history" ADD CONSTRAINT "workout_history_workoutId_fkey" FOREIGN KEY ("workoutId") REFERENCES "workouts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "physical_evaluations" ADD CONSTRAINT "physical_evaluations_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "body_measurements" ADD CONSTRAINT "body_measurements_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "physical_evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evolution_photos" ADD CONSTRAINT "evolution_photos_evaluationId_fkey" FOREIGN KEY ("evaluationId") REFERENCES "physical_evaluations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evolution_photos" ADD CONSTRAINT "evolution_photos_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "goals" ADD CONSTRAINT "goals_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_events" ADD CONSTRAINT "schedule_events_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_events" ADD CONSTRAINT "schedule_events_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weight_records" ADD CONSTRAINT "weight_records_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "load_records" ADD CONSTRAINT "load_records_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "load_records" ADD CONSTRAINT "load_records_workoutExerciseId_fkey" FOREIGN KEY ("workoutExerciseId") REFERENCES "workout_exercises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "students"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
