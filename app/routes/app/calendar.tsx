import { AppointmentType, Recurrence } from "@prisma/client";
import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { useActionData, useLoaderData, useSubmit } from "@remix-run/react";
import { z } from "zod";
import Calendar from "~/components/Calendar";
import { createUserAppointment, createUserWorkoutSession, deleteUserAppointment, deleteUserWorkoutSession, getAllCoaches, getAllUserAppointments, getAllUserWorkoutSessions, isAppointmentConflict, isWorkoutSessionConflict, updateUserAppointment, updateUserWorkoutSession } from "~/models/calendar.server";
import { getAllUserWorkoutNames } from "~/models/workout.server";
import { requireLoggedInUser } from "~/utils/auth.server";
import { convertObjectToFormData } from "~/utils/misc";
import { validateForm, } from "~/utils/validation";
import { toast } from "sonner";
import { useEffect } from "react";
import { darkModeCookie } from "~/cookies";

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
  const coachOptions = coaches.map(coach => ({
    label: coach.name,
    value: coach.id,
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
const themeSchema = z.object({
  darkMode: z.string(),
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
          const conflictAppointment = await isAppointmentConflict(data.startTime, data.endTime)
          const conflictSession = await isWorkoutSessionConflict(data.startTime, data.endTime)
          if (conflictAppointment || conflictSession) {
            return { warning: "This appointment conflicts with another scheduled event" }
          }
          createUserAppointment(user.id, coachId, appointmentObj)
          return { message: "Appointment has been scheduled" }
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
          const conflictAppointment = await isAppointmentConflict(data.startTime, data.endTime, data?.id)
          const conflictSession = await isWorkoutSessionConflict(data.startTime, data.endTime)
          if (conflictAppointment || conflictSession) {
            return { warning: "This appointment conflicts with another scheduled event" }
          }
          updateUserAppointment(user.id, coachId, appointmentObj)
          return { message: "Appointment has been updated" }
        },
        (errors) => json({ errors }, { status: 400 })
      )
    }
    case "delete_appointment": {
      return validateForm(
        formData,
        deleteAppointmentSchema,
        async ({ id }) => {
          deleteUserAppointment(user.id, id)
          return { message: "Appointment has been deleted" }
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
          const conflictAppointment = await isAppointmentConflict(data.startTime, data.endTime)
          const conflictSession = await isWorkoutSessionConflict(data.startTime, data.endTime)
          if (conflictAppointment || conflictSession) {
            return { warning: "This workout conflicts with another scheduled event" }
          }
          createUserWorkoutSession(user.id, workoutId, sessionObj)
          return { message: "Workout has been scheduled" }
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
          const conflictAppointment = await isAppointmentConflict(data.startTime, data.endTime)
          const conflictSession = await isWorkoutSessionConflict(data.startTime, data.endTime, data?.id)
          if (conflictAppointment || conflictSession) {
            return { warning: "This workout conflicts with another scheduled event" }
          }
          updateUserWorkoutSession(user.id, workoutId, sessionObj)
          return { message: "Workout has been updated" }
        },
        (errors) => json({ errors }, { status: 400 })
      )
    }
    case "delete_workout_session": {
      return validateForm(
        formData,
        deleteSessionSchema,
        async ({ id }) => {
          deleteUserWorkoutSession(user.id, id)
          return { message: "Workout has been deleted" }
        },
        (errors) => json({ errors }, { status: 400 })
      )
    }
    case "toggleDarkMode": {
      return validateForm(
        formData,
        themeSchema,
        async ({ darkMode }) => json(
          { success: true },
          {
            headers: {
              "Set-Cookie": `fitizen__darkMode=${darkMode}; SameSite=Strict`,
            },
          }
        ),
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
  const actionData = useActionData<{ [key: string]: any }>();

  useEffect(() => {
    if (actionData) {
      if (actionData.errors) {
        toast.error("Uh oh. The request failed")
      } else if (actionData.message) {
        toast.success(actionData.message)
      } else if (actionData.warning) {
        toast.warning(actionData.warning)
      }
    }
  }, [actionData])
  const submit = useSubmit();
  const handleSubmitEvent = (formObj: submitEventType) => {
    const formData = convertObjectToFormData(formObj)
    submit(formData, { method: "post" })
  }
  return (
    <div className="h-[calc(100vh-4rem)]">
      {/* This is the Schedule page */}
      <Calendar
        submitEvent={handleSubmitEvent}
        formOptions={{ coaches, userWorkouts }}
        schedule={{ appointments, userSessions }}
      />
    </div>
  )
}