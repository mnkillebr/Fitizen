import { AppointmentType, Prisma, Recurrence } from "@prisma/client";
import db from "~/db.server";

export type WorkoutSessionObject = {
  id?: string;
  startTime: string;
  endTime: string;
  recurrence?: Recurrence;
}

export type AppointmentObject = {
  id?: string;
  startTime: string;
  endTime: string;
  type: AppointmentType;
}

export function getAllCoaches() {
  return db.coach.findMany();
}

export function getAllUserAppointments(userId: string) {
  return db.appointment.findMany({
    where: {
      userId,
    },
  })
}

export async function createUserAppointment(userId: string, coachId: string, appointmentObj: AppointmentObject) {
  try {
    const createAppointment = await db.appointment.create({
      data: {
        userId,
        coachId,
        startTime: appointmentObj.startTime,
        endTime: appointmentObj.endTime,
        type: appointmentObj.type,
      },
    });
    return createAppointment;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2011") {
        return error.message
      }
    }
    throw error
  };
}

export async function isAppointmentConflict(newStartTime: string, newEndTime: string, appointmentId?: string): Promise<boolean> {
  const conflictingAppointments = await db.appointment.findMany({
    where: {
      id: {
        not: appointmentId,
      },
      OR: [
        {
          startTime: {
            lte: newEndTime,
          },
          endTime: {
            gte: newStartTime,
          },
        }
      ]
    }
  });

  return conflictingAppointments.length > 0;
}

export async function updateUserAppointment(userId: string, coachId: string, appointmentObj: AppointmentObject) {
  try {
    const updateAppointment = await db.appointment.update({
      where: {
        id: appointmentObj.id,
      },
      data: {
        userId,
        coachId,
        startTime: appointmentObj.startTime,
        endTime: appointmentObj.endTime,
        type: appointmentObj.type,
      },
    });
    return updateAppointment;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2011") {
        return error.message
      }
    }
    throw error
  };
}

export async function deleteUserAppointment(userId: string, appointmentId: string) {
  try {
    const deleteAppointment = await db.appointment.delete({
      where: {
        id: appointmentId,
        userId,
      },
    });
    return deleteAppointment;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2011") {
        return error.message
      }
    }
    throw error
  };
}

export function getAllUserWorkoutSessions(userId: string) {
  return db.workoutSession.findMany({
    where: {
      userId,
    },
  })
}

export async function createUserWorkoutSession(userId: string, workoutId: string, sessionObj: WorkoutSessionObject) {
  try {
    const createWorkoutSession = await db.workoutSession.create({
      data: {
        userId,
        routineId: workoutId,
        startTime: sessionObj.startTime,
        endTime: sessionObj.endTime,
        recurrence: sessionObj.recurrence,
      },
    });
    return createWorkoutSession;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2011") {
        return error.message
      }
    }
    throw error
  };
}

export async function isWorkoutSessionConflict(newStartTime: string, newEndTime: string, sessionId?: string): Promise<boolean> {
  const conflictingWorkouts = await db.workoutSession.findMany({
    where: {
      id: {
        not: sessionId,
      },
      OR: [
        {
          startTime: {
            lte: newEndTime,
          },
          endTime: {
            gte: newStartTime,
          },
        }
      ]
    }
  });

  return conflictingWorkouts.length > 0;
}

export async function updateUserWorkoutSession(userId: string, workoutId: string, sessionObj: WorkoutSessionObject) {
  try {
    const updateSession = await db.workoutSession.update({
      where: {
        id: sessionObj.id,
      },
      data: {
        userId,
        routineId: workoutId,
        startTime: sessionObj.startTime,
        endTime: sessionObj.endTime,
        recurrence: sessionObj.recurrence,
      },
    });
    return updateSession;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2011") {
        return error.message
      }
    }
    throw error
  };
}

export async function deleteUserWorkoutSession(userId: string, sessionId: string) {
  try {
    const deleteSession = await db.workoutSession.delete({
      where: {
        id: sessionId,
        userId,
      },
    });
    return deleteSession;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2011") {
        return error.message
      }
    }
    throw error
  };
}
