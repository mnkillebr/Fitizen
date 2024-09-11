import { ChevronDownIcon, PlusCircleIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { MagnifyingGlassIcon as SearchIcon, TrashIcon } from "@heroicons/react/24/outline";
import { Form, Link, json, useLoaderData, useNavigation, useSearchParams, useSubmit } from "@remix-run/react";
import { Field, Fieldset, Input, Label, Legend, Textarea } from "@headlessui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Button, PrimaryButton } from "~/components/form";
import { useCallback, useState } from "react";
import { LoaderFunctionArgs } from "@remix-run/node";
import { getAllExercises } from "~/models/exercise.server";
import { Exercise } from "../exercises";
import clsx from "clsx";
import { FieldErrors } from "~/utils/validation";
import { isEmptyObject } from "~/utils/misc";

type ExerciseProps = {
  id: string;
  name: string;
  body: string[];
  contraction: string | null;
}

type PanelItemProps = {
  addCallbackFn: () => void;
  removeCallbackFn: (item: ExerciseProps) => void;
  panelText: string;
  subItems?: Array<ExerciseProps>;
}

type SelectedExercisesType = {
  [key: string]: Array<ExerciseProps>;
}

const PanelItem = ({ addCallbackFn, removeCallbackFn, panelText, subItems = [] }: PanelItemProps) => {
  return (
    <div>
      {subItems.map((subItem, idx) => (
        <div key={subItem.id} className="flex relative bg-slate-100 rounded-lg items-center first:mt-0 my-2 shadow-md h-8">
          <p className="border-r w-8 px-2 text-center">{idx+1}</p>
          <p className="ml-2 min-w-40 max-w-60 truncate shrink">{subItem.name}</p>
          <button className="absolute right-3" onClick={() => removeCallbackFn(subItem)}>
            <TrashIcon className="size-4 text-red-500" />
          </button>
        </div>
      ))}
      <div className="border-2 border-dashed rounded-md px-3 py-2 flex flex-col justify-center items-center my-1">
        <p className="text-sm text-slate-400">{panelText}</p>
        <button onClick={addCallbackFn}>
          <PlusCircleIcon className="size-10 text-accent"/>
        </button>
      </div>
    </div>
  )
}

type AccordionItemProps = {
  title: string;
  content: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
}

const AccordionItem = ({ title, content, isOpen, onClick }: AccordionItemProps) => {
  return (
    <div className="border-b lg:w-2/3 xl:w-1/2">
      <button
        className="w-full py-4 flex justify-between items-center focus:outline-none"
        onClick={onClick}
      >
        <span className="text-sm font-medium">{title}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDownIcon className="w-5 h-5" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial="collapsed"
            animate="open"
            exit="collapsed"
            variants={{
              open: { opacity: 1, height: "auto" },
              collapsed: { opacity: 0, height: 0 }
            }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q");
  const exercises = await getAllExercises(query);
  return json({ exercises })
}

export default function Classic() {
  const data = useLoaderData<typeof loader>();
  const navigation = useNavigation();
  const submit = useSubmit();
  const [searchParams, setSearchParams] = useSearchParams();

  const isSearching = navigation.formData?.has("q");
  const isSavingWorkout = navigation.formData?.get("_action") === "createCustomWorkout";

  const [openExercisesPanel, setOpenExercisesPanel] = useState(false);
  const [openIndex, setOpenIndex] = useState<null | number>(1);
  const [selectedExercises, setSelectedExercises] = useState<SelectedExercisesType>({});
  const [workoutName, setWorkoutName] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [workoutDescription, setWorkoutDescription] = useState("")

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  const toggleExercisesPanel = () => setOpenExercisesPanel(!openExercisesPanel);
  const handleSelectExercise = useCallback((exercise: ExerciseProps) => {
    const currentPanelExercises = openIndex !== null && selectedExercises[openIndex] ? selectedExercises[openIndex] : []
    const isIncluded = currentPanelExercises.map(sel_ex => sel_ex.id).includes(exercise.id);
    const updatedExerciseList = isIncluded 
      ? currentPanelExercises.filter(sel_ex => sel_ex.id !== exercise.id)
      : [...currentPanelExercises, exercise];
    setSelectedExercises({
      ...selectedExercises,
      [`${openIndex}`]: updatedExerciseList,
    })
    updatedExerciseList.length && setErrors({ ...errors, "exercises": "" })
  }, [openIndex, selectedExercises]);
  const handleSaveWorkout = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!workoutName) {
      return setErrors({ ...errors, "workoutName": "Name cannot be blank", })
    } else if (isEmptyObject(selectedExercises)) {
      return setErrors({ ...errors, "exercises": "You must add at least one exercise" })
    }
    if (isEmptyObject(errors)) {
      const formData = new FormData();
      formData.append("_action", "createCustomWorkout")
      formData.append("name", workoutName)
      formData.append("description", workoutDescription)
      formData.append("selectedExercises", JSON.stringify(selectedExercises));
  
      return submit(formData, { method: "post", action: "/app/workouts" });
    }
  }, [selectedExercises, workoutName, workoutDescription, errors, setErrors])

  const accordianItems = [
    {
      title: "Warmup",
      content: (
        <PanelItem
          addCallbackFn={toggleExercisesPanel}
          removeCallbackFn={handleSelectExercise}
          panelText="Add warmup exercise(s)"
          subItems={openIndex !== null ? selectedExercises[openIndex] : []}
        />
      )
    },
    {
      title: "Main",
      content: (
        <PanelItem
          addCallbackFn={toggleExercisesPanel}
          removeCallbackFn={handleSelectExercise}
          panelText="Add main exercise(s)"
          subItems={openIndex !== null ? selectedExercises[openIndex] : []}
        />
      )
    },
    {
      title: "Cooldown",
      content: (
        <PanelItem
          addCallbackFn={toggleExercisesPanel}
          removeCallbackFn={handleSelectExercise}
          panelText="Add cooldown exercise(s)"
          subItems={openIndex !== null ? selectedExercises[openIndex] : []}
        />
      )
    },
  ];

  return (
    <>
      {/* <AnimatePresence> */}
        <div
          className="flex flex-col gap-y-2 h-full relative px-2 justify-between"
          // initial={{ translateY: "-50%", opacity: 0 }}
          // animate={{ translateY: "0%", opacity: 1 }}
          // exit={{ translateY: "-50%" }}
        >
          <div className="overflow-y-auto">
            <Fieldset className="space-y-6 rounded-xl bg-white/5">
              <Legend className="text-base/7 font-semibold">Create Interval Workout</Legend>
              <Field className="flex flex-col">
                <Label className="text-sm/6 font-medium">Name<span className="text-xs ml-1">*</span></Label>
                <Input
                  type="text"
                  value={workoutName}
                  autoComplete="off"
                  onChange={(e) => {
                    const inputValue = e.target.value
                    setWorkoutName(inputValue)
                    inputValue.length ? setErrors({ ...errors, "workoutName": "" }) : null
                  }}
                  className={clsx(
                    "p-2 rounded-md border-2 focus:outline-accent lg:w-2/3 xl:w-1/2 text-sm/6",
                    errors["workoutName"] ? "border-red-500" : ""
                  )}
                  placeholder="Name your workout"
                />
                {errors["workoutName"] ? <span className="text-red-500 text-xs">{errors["workoutName"]}</span> : null}
              </Field>
              <Field className="flex flex-col">
                <Label className="text-sm/6 font-medium">Description</Label>
                {/* <Description className="text-xs">
                  A good way to reference the goals of the workout
                </Description> */}
                <Textarea
                  className="p-2 rounded-md border-2 focus:outline-accent lg:w-2/3 xl:w-1/2 text-sm/6 resize-none"
                  placeholder="Optional"
                  rows={3}
                  value={workoutDescription}
                  onChange={(e) => setWorkoutDescription(e.target.value)}
                />
              </Field>
            </Fieldset>
            {accordianItems.map((item, index) => (
              <AccordionItem
                key={index}
                title={item.title}
                content={item.content}
                isOpen={openIndex === index}
                onClick={() => toggleAccordion(index)}
              />
            ))}
            {errors["exercises"] ? <span className="text-red-500 text-xs">{errors["exercises"]}</span> : null}
          </div>
          {/* <div className="border-2 border-dashed rounded-md px-3 py-2 flex-1 flex flex-col justify-center items-center">
            <p className="font-bold text-lg">Warmup</p>
            <button>
              <PlusCircleIcon className="size-10 text-accent"/>
            </button>
          </div>
          <div className="border-2 border-dashed rounded-md px-3 py-2 flex-1 flex flex-col justify-center items-center">
            <p className="font-bold text-lg">Main</p>
            <button>
              <PlusCircleIcon className="size-10 text-accent"/>
            </button>
          </div>
          <div className="border-2 border-dashed rounded-md px-3 py-2 flex-1 flex flex-col justify-center items-center">
            <p className="font-bold text-lg">Cooldown</p>
            <button>
              <PlusCircleIcon className="size-10 text-accent"/>
            </button>
          </div> */}
          <div className="w-full lg:w-2/3 xl:w-1/2 flex flex-none gap-x-2 items-center">
            <Link to="/app/workouts" className="flex-1">
              <Button className="w-full border-2 text-accent border-accent hover:bg-gray-50">
                Cancel
              </Button>
            </Link>
            <Form onSubmit={handleSaveWorkout} className="w-1/2">
              <PrimaryButton
                className="w-full"
                type="submit"
                isLoading={isSavingWorkout}
              >
                Save
              </PrimaryButton>
            </Form>
          </div>
        </div>
      {/* </AnimatePresence> */}
      <AnimatePresence>
        {openExercisesPanel && (
          <motion.div
            className="absolute bottom-0 left-0 md:left-80 md:max-w-[calc(100vw-20rem)] flex flex-col gap-y-2 h-2/3 bg-slate-400 w-screen rounded-t-lg text-white px-8 py-6"
            initial={{ translateY: "100%" }}
            animate={{ translateY: "0%" }}
            exit={{ translateY: "100%" }}
            transition={{ ease: [0, 0.71, 0.2, 1.01], }}
          >
            <div className="flex justify-between">
              <p>Exercises</p>
              <button onClick={(event) => {
                setOpenExercisesPanel(false)
                setSearchParams((prev) => {
                  prev.set("q", "");
                  return prev;
                });
              }}>
                <XMarkIcon className="size-6 hover:text-accent"/>
              </button>
            </div>
            <Form
              className={`flex content-center border-2 rounded-md focus-within:border-accent lg:w-2/3 xl:w-1/2 bg-white ${
                isSearching ? "animate-pulse" : ""
              }`}
            >
              <button type="submit">
                <SearchIcon className="size-6 ml-2 text-slate-400" />
              </button>
              <input
                defaultValue={searchParams.get("q") ?? ""}
                type="text"
                name="q"
                placeholder="Search exercises ..."
                autoComplete="off"
                className="w-full p-2 outline-none rounded-md text-slate-400"
              />
            </Form>
            <div className="flex flex-col gap-y-2 xl:grid xl:grid-cols-2 xl:gap-4 snap-y snap-mandatory overflow-y-auto text-slate-900">
              {data.exercises.map((ex_item) => (
                <Exercise
                  key={ex_item.id}
                  exercise={ex_item}
                  selectable
                  selectFn={handleSelectExercise}
                  selected={selectedExercises[`${openIndex}`]?.map(sel_ex => sel_ex.id).includes(ex_item.id)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
