import { AppointmentType, Recurrence } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { z } from "zod";
import Calendar from "~/components/Calendar";
import { createUserAppointment, createUserWorkoutSession, deleteUserAppointment, deleteUserWorkoutSession, getAllCoaches, getAllUserAppointments, getAllUserWorkoutSessions, updateUserAppointment, updateUserWorkoutSession } from "~/models/calendar.server";
import { getAllUserWorkoutNames } from "~/models/workout.server";
import { requireLoggedInUser } from "~/utils/auth.server";
import { convertObjectToFormData } from "~/utils/misc";
import { validateForm, } from "~/utils/validation";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireLoggedInUser(request);
  const coaches = await getAllCoaches();
  const appointments = await getAllUserAppointments(user.id)
  const userWorkouts = await getAllUserWorkoutNames(user.id)
  const userSessions = await getAllUserWorkoutSessions(user.id)
  const coachMappedAppointments = appointments.map(appointment => ({
    ...appointment,
    coach: coaches.find(coach => coach.id === appointment.coachId)?.name
  }))
  const nameMappedSessions = userSessions.map(session => ({
    ...session,
    routineName: userWorkouts.find(workout => workout.id === session.routineId)?.name
  }))
  return json({ coaches, appointments: coachMappedAppointments, userWorkouts, userSessions: nameMappedSessions })
}

const appointmentSchema = z.object({
  id: z.string().optional(),
  coachId: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  type: z.string(),
})
const deleteAppointmentSchema = z.object({
  id: z.string(),
})
const sessionSchema = z.object({
  id: z.string().optional(),
  workoutId: z.string(),
  recurrence: z.string().optional(),
  startTime: z.string(),
  endTime: z.string(),
})
const deleteSessionSchema = z.object({
  id: z.string(),
})

export async function action({ request }: ActionFunctionArgs) {
  const user = await requireLoggedInUser(request);
  const formData = await request.formData();
  switch (formData.get("formType")) {
    case "appointment": {
      return validateForm(
        formData,
        appointmentSchema,
        async (data) => {
          const {
            coachId,
            ...rest
          } = data
          const appointmentObj = {
            ...rest,
            type: rest.type === "goal_setting" ? AppointmentType.GOAL_SETTING : AppointmentType.FOLLOWUP,
          }
          return createUserAppointment(user.id, coachId, appointmentObj)
        },
        (errors) => json({ errors }, { status: 400 })
      )
    }
    case "update_appointment": {
      return validateForm(
        formData,
        appointmentSchema,
        async (data) => {
          const {
            coachId,
            ...rest
          } = data
          const appointmentObj = {
            ...rest,
            type: rest.type === "goal_setting" ? AppointmentType.GOAL_SETTING : AppointmentType.FOLLOWUP,
          }
          return updateUserAppointment(user.id, coachId, appointmentObj)
        },
        (errors) => json({ errors }, { status: 400 })
      )
    }
    case "delete_appointment": {
      return validateForm(
        formData,
        deleteAppointmentSchema,
        async ({ id }) => {
          return deleteUserAppointment(user.id, id)
        },
        (errors) => json({ errors }, { status: 400 })
      )
    }
    case "workout_session": {
      return validateForm(
        formData,
        sessionSchema,
        async (data) => {
          const {
            workoutId,
            ...rest
          } = data
          const sessionObj = {
            ...rest,
            recurrence: rest.recurrence === "daily" ? Recurrence.DAILY : rest.recurrence === "weekly" ? Recurrence.WEEKLY : rest.recurrence === "monthly" ? Recurrence.MONTHLY : undefined,
          }
          return createUserWorkoutSession(user.id, workoutId, sessionObj)
        },
        (errors) => json({ errors }, { status: 400 })
      )
    }
    case "update_workout_session": {
      return validateForm(
        formData,
        sessionSchema,
        async (data) => {
          const {
            workoutId,
            ...rest
          } = data
          const sessionObj = {
            ...rest,
            recurrence: rest.recurrence === "daily" ? Recurrence.DAILY : rest.recurrence === "weekly" ? Recurrence.WEEKLY : rest.recurrence === "monthly" ? Recurrence.MONTHLY : undefined,
          }
          return updateUserWorkoutSession(user.id, workoutId, sessionObj)
        },
        (errors) => json({ errors }, { status: 400 })
      )
    }
    case "delete_workout_session": {
      return validateForm(
        formData,
        deleteSessionSchema,
        async ({ id }) => {
          return deleteUserWorkoutSession(user.id, id)
        },
        (errors) => json({ errors }, { status: 400 })
      )
    }
    default: {
      return null;
    }
  }
}

type submitEventType = {
  formType: string;
  dateTime: Date;
  appointmentType: string;
  coach: string;
  recurrence: string;
  sessionType: string;
}

export default function Schedule() {
  const { coaches, appointments, userWorkouts, userSessions } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const handleSubmitEvent = (formObj: submitEventType) => {
    const formData = convertObjectToFormData(formObj)
    submit(formData, { method: "post" })
  }
  return (
    <div className="h-full">
      {/* This is the Schedule page */}
      <Calendar
        submitEvent={handleSubmitEvent}
        formOptions={{ coaches, userWorkouts }}
        schedule={{ appointments, userSessions }}
      />
    </div>
  )
}