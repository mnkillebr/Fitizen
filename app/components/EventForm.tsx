import { useCloseDialog } from './Dialog';
import clsx from 'clsx';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import AppointmentForm from './AppointmentForm';
import SessionForm from './SessionForm';

interface EventFormProps {
  selectedDateTime: Date | null;
  submitEvent: (args: any) => void;
  formOptions: {
    [key: string]: any;
  };
}

const EventForm = ({ selectedDateTime, submitEvent, formOptions }: EventFormProps) => {
  const closeDialog = useCloseDialog();
  const eventTypes = [
    {
      name: "Workout",
      form: <SessionForm
        selectedDateTime={selectedDateTime}
        onCancel={() => {
          closeDialog()
        }}
        onSubmit={(args) => {
          submitEvent(args)
          closeDialog()
        }}
        defaults={formOptions.defaults}
        workouts={formOptions.userWorkouts}
      />
    },
    {
      name: "Appointment",
      form: <AppointmentForm
        selectedDateTime={selectedDateTime}
        onCancel={() => {
          closeDialog()
        }}
        onSubmit={(args) => {
          submitEvent(args)
          closeDialog()
        }}
        defaults={formOptions.defaults}
        coaches={formOptions.coaches}
      />
    },
  ]

  return (
    <Tabs className="w-full" defaultValue={formOptions.defaults?.defaultTab ?? "Workout"}>
      <TabsList>
        {eventTypes.map(({ name }, index) => {
          const defaultTab = formOptions.defaults?.defaultTab !== undefined ? formOptions.defaults?.defaultTab : undefined
          const disabledTab = defaultTab === undefined ? false : defaultTab !== undefined && defaultTab === name ? false : true
          return (
            <TabsTrigger
              key={name}
              disabled={disabledTab}
              // className={clsx(
              //   "rounded-full py-1 px-3 text-sm/6 font-semibold",
              //   "focus:outline-none data-[selected]:bg-primary data-[hover]:bg-primary/20 dark:data-[hover]:bg-primary/35",
              //   "data-[selected]:data-[hover]:bg-primary data-[focus]:outline-1 data-[focus]:outline-primary/20",
              //   "disabled:cursor-not-allowed"
              // )}
              value={name}
            >
              {name}
            </TabsTrigger>
          )
        })}
      </TabsList>
      {eventTypes.map(({ name, form }) => (
        <TabsContent key={name} value={name} className="w-full min-w-72 md:min-w-[400px]">
          {form}
        </TabsContent>
      ))}
    </Tabs>
  )
}

export default EventForm;