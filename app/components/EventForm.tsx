import { useCloseDialog } from './Dialog';
import clsx from 'clsx';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
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
  ]

  return (
    <TabGroup className="w-full" defaultIndex={formOptions.defaults?.defaultTab}>
      <TabList className="flex gap-4">
        {eventTypes.map(({ name }, index) => {
          const defaultTab = formOptions.defaults?.defaultTab !== undefined ? formOptions.defaults?.defaultTab : undefined
          const disabledTab = defaultTab === undefined ? false : defaultTab !== undefined && defaultTab === index ? false : true
          return (
            <Tab
              key={name}
              disabled={disabledTab}
              className={clsx(
                "rounded-full py-1 px-3 text-sm/6 font-semibold",
                "focus:outline-none data-[selected]:bg-slate-200 data-[hover]:bg-slate-100",
                "data-[selected]:data-[hover]:bg-slate-200 data-[focus]:outline-1 data-[focus]:outline-slate-100",
                "disabled:cursor-not-allowed"
              )}
            >
              {name}
            </Tab>
          )
        })}
      </TabList>
      <TabPanels className="p-2">
        {eventTypes.map(({ name, form }) => (
          <TabPanel key={name} className="w-full">
            {form}
          </TabPanel>
        ))}
      </TabPanels>
    </TabGroup>
  )
}

export default EventForm;