type ExerciseItemType = {
  id: string;
  target: string;
  reps: string;
  name: string;
  time: string;
  notes: string;
  sets: string;
}

interface CircuitLogProps {
  item: {
    exercises: Array<ExerciseItemType>;
    circuitId: string;
  };
  index: number;
  unitOptions: string[];
  exerciseDetails: Array<{
    id: string;
    exercises: any[];
    circuitId: string;
  }>
  flatDetails: Array<{
    id: string;
    routineId: string;
    exerciseId: string;
    circuitId: string;
  }>
}

interface ExerciseLogProps {
  item: ExerciseItemType;
  index: number;
  unitOptions: string[];
  exerciseDetails: Array<{
    id: string;
    exercises: any[];
    circuitId: string;
  }>
  flatDetails: Array<{
    id: string;
    routineId: string;
    exerciseId: string;
    circuitId: string;
  }>
}

type SetType = {
  name: string;
  set: string;
  time: string;
  target: string;
  targetReps: string;
  actualReps: string;
  load: string;
  unit: string;
  notes: string;
}

interface PastLogProps {
  exercise: {
    id?: string;
    exerciseName?: string;
    circuitId?: string;
    target?: string;
    targetReps?: string;
    time?: string;
    sets: Array<SetType>;
  }
  index: number;
  logs: Array<{
    circuitId?: string;
  }>
}

export function CircuitLog({ item, index, unitOptions, exerciseDetails, flatDetails }: CircuitLogProps) {
  const numSets = item.exercises.find((ex_item: ExerciseItemType) => ex_item.sets)?.sets as string;
  return (
    <div key={`${item.circuitId}-${index}`} className="flex flex-col">
      <div className="flex gap-x-1 flex-nowrap">
        <div className="flex-none font-semibold w-28">{`Circuit #${exerciseDetails.filter(e => e.exercises).findIndex(e => e.circuitId === item.circuitId) + 1}:`}</div>
      </div>
      <div className="border-2 border-dashed border-gray-200 p-2 rounded shadow-inner flex flex-col gap-y-1">
        {[...Array(parseInt(numSets))].map((set: unknown, idx: number) =>
          <div key={`${index}-${idx}`} className="border rounded">
            {item.exercises.map((ex_item: ExerciseItemType, ex_idx: number) => {
              const currentSet = idx + 1
              const exerciseIndex = flatDetails.findIndex((d: { id: string }) => d.id === ex_item.id)
              return (
                <div key={`${idx}-${ex_idx}`} className="bg-slate-100 px-2 py-1 rounded">
                  {ex_idx === 0 ? <div className="tex-base font-semibold">{`Set ${currentSet}`}</div> : null}
                  <input type="hidden" name={`exercises[${exerciseIndex}].circuitId`} value={item.circuitId} />
                  <input type="hidden" name={`exercises[${exerciseIndex}].exerciseId`} value={ex_item.id} />
                  <input type="hidden" name={`exercises[${exerciseIndex}].target`} value={ex_item.target} />
                  <input type="hidden" name={`exercises[${exerciseIndex}].targetReps`} value={ex_item?.reps} />
                  <input type="hidden" name={`exercises[${exerciseIndex}].time`} value={ex_item?.time} />
                  <input type="hidden" name={`exercises[${exerciseIndex}].sets[${idx}].set`} value={currentSet} />
                  <div className="flex flex-wrap gap-x-3">
                    <div className="flex flex-col w-full sm:w-56 truncate">
                      <label className="text-xs font-semibold">Name</label>
                      <div>{ex_item.name}</div>
                    </div>
                    {ex_item.target === "reps" ? (
                      <>
                        <div className="flex flex-col">
                          <label className="text-xs font-semibold">Target Reps</label>
                          <div className="text-center">{ex_item?.reps}</div>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-semibold">Actual Reps</label>
                          <input
                            type="number"
                            className="w-11 text-right"
                            name={`exercises[${exerciseIndex}].sets[${idx}].actualReps`}
                            placeholder={ex_item?.reps}
                            min={1}
                            max={999}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold capitalize">Time</label>
                        <div className="text-center">{ex_item?.time}</div>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold">Load</label>
                      <input
                        type="number"
                        className="w-11 rounded"
                        name={`exercises[${exerciseIndex}].sets[${idx}].load`}
                        min={0}
                        max={999}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold">Load Units</label>
                      <select
                        defaultValue="lb(s)"
                        name={`exercises[${exerciseIndex}].sets[${idx}].unit`}
                      >
                        {unitOptions.map((unit, unit_idx) => <option key={unit_idx}>{unit}</option>)}
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold">Notes</label>
                      <input
                        type="text"
                        className="w-36"
                        placeholder="Optional"
                        name={`exercises[${exerciseIndex}].sets[${idx}].notes`}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export function ExerciseLog({ item, index, unitOptions, exerciseDetails, flatDetails }: ExerciseLogProps) {
  return (
    <div key={`${item.name}-${index}`} className="flex flex-col">
      <div className="flex gap-x-1 flex-nowrap">
        <div className="flex-none font-semibold w-28">{`Exercise #${exerciseDetails.filter(e => !e.exercises).findIndex(e => e.id === item.id) + 1}:`}</div>
        <div className="flex-1 truncate">{item.name}</div>
      </div>
      <div className="flex flex-col gap-y-1 p-2">
        {[...Array(parseInt(item.sets))].map((set: unknown, idx: number) => {
          const currentSet = idx + 1
          const exerciseIndex = flatDetails.findIndex((d: { id: string }) => d.id === item.id)
          return (
            <div key={idx} className="flex flex-wrap gap-x-3 items-center bg-slate-100 px-2 py-1 rounded border">
              <div className="w-full sm:w-16 font-semibold">{`Set ${currentSet}`}</div>
              <input type="hidden" name={`exercises[${exerciseIndex}].exerciseId`} value={item.id} />
              <input type="hidden" name={`exercises[${exerciseIndex}].target`} value={item.target} />
              <input type="hidden" name={`exercises[${exerciseIndex}].targetReps`} value={item?.reps} />
              <input type="hidden" name={`exercises[${exerciseIndex}].time`} value={item?.time} />
              <input type="hidden" name={`exercises[${exerciseIndex}].sets[${idx}].set`} value={currentSet} />
              {item.target === "reps" ? (
                <>
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold">Target Reps</label>
                    <div className="text-center">{item?.reps}</div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold">Actual Reps</label>
                    <input
                      type="number"
                      className="w-11 text-right"
                      name={`exercises[${exerciseIndex}].sets[${idx}].actualReps`}
                      placeholder={item?.reps}
                      min={1}
                      max={999}
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col">
                  <label className="text-xs font-semibold capitalize">Time</label>
                  <div className="text-center">{item?.time}</div>
                </div>
              )}
              <div className="flex flex-col">
                <label className="text-xs font-semibold">Load</label>
                <input
                  type="number"
                  className="w-11 rounded"
                  name={`exercises[${exerciseIndex}].sets[${idx}].load`}
                  min={0}
                  max={999}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold">Load Units</label>
                <select
                  defaultValue="lb(s)"
                  name={`exercises[${exerciseIndex}].sets[${idx}].unit`}
                >
                  {unitOptions.map((unit, unit_idx) => <option key={unit_idx}>{unit}</option>)}
                </select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold">Notes</label>
                <input
                  type="text"
                  className="w-36"
                  placeholder="Optional"
                  name={`exercises[${exerciseIndex}].sets[${idx}].notes`}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function PastCircuitLog({ exercise, index, logs }: PastLogProps) {
  return (
    <div key={`${exercise.circuitId}-${index}`} className="flex flex-col">
      <div className="flex gap-x-1 flex-nowrap">
        <div className="flex-none font-semibold w-28">{`Circuit #${logs.filter((e: any) => e.circuitId).findIndex((e: any) => e.circuitId === exercise.circuitId) + 1}:`}</div>
      </div>
      <div className="border-2 border-dashed border-gray-200 p-2 rounded shadow-inner flex flex-col gap-y-1">
        {exercise.sets.map((set: SetType, idx: number) =>
          <div key={`${index}-${idx}`} className="border rounded bg-slate-100 px-2 py-1">
            <div className="flex w-full mb-1">
              <div className="text-base font-semibold mr-6">{`Set ${set.set}`}</div>
              <div className="flex flex-col sm:w-56 truncate">{set.name}</div>
            </div>
            <div className="flex flex-wrap gap-x-6">
              {/* <div className="flex flex-col w-full sm:w-56 truncate">
                <label className="text-xs font-semibold">Name</label>
                <div>{set.name}</div>
              </div> */}
              {set.target === "reps" ? (
                <>
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold">Target Reps</label>
                    <div className="text-center">{set?.targetReps}</div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold">Actual Reps</label>
                    <div className="text-center">{set?.actualReps}</div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col">
                  <label className="text-xs font-semibold capitalize">Time</label>
                  <div className="text-center">{set?.time}</div>
                </div>
              )}
              <div className="flex flex-col">
                <label className="text-xs font-semibold">Load</label>
                <div className="text-center">{set?.load}</div>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold">Load Units</label>
                <div className="text-center">{set?.unit === "kilogram" ? "kg(s)" : set?.unit === "pound" ? "lb(s)": set?.unit}</div>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold">Notes</label>
                <div className="text-start">{set?.notes}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function PastExerciseLog({ exercise, index, logs }: PastLogProps) {
  return (
    <div key={`${exercise.id}-${index}`} className="flex flex-col">
      <div className="flex gap-x-1 flex-nowrap">
        <div className="flex-none font-semibold w-28">{`Exercise #${logs.filter((e: any) => !e.circuitId).findIndex((e: any) => e.id === exercise.id) + 1}:`}</div>
        <div className="flex-1 truncate">{exercise?.exerciseName}</div>
      </div>
      <div className="rounded shadow-inner flex flex-col gap-y-1">
        {exercise.sets.map((set: SetType, idx: number) =>
          <div key={`${index}-${idx}`} className="border rounded bg-slate-100 px-2 py-1">
            <div className="text-base font-semibold mb-1">{`Set ${set.set}`}</div>
            <div className="flex flex-wrap gap-x-6">
              {exercise.target === "reps" ? (
                <>
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold">Target Reps</label>
                    <div className="text-center">{exercise?.targetReps}</div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold">Actual Reps</label>
                    <div className="text-center">{set?.actualReps}</div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col">
                  <label className="text-xs font-semibold capitalize">Time</label>
                  <div className="text-center">{exercise?.time}</div>
                </div>
              )}
              <div className="flex flex-col">
                <label className="text-xs font-semibold">Load</label>
                <div className="text-center">{set?.load}</div>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold">Load Units</label>
                <div className="text-center">{set?.unit === "kilogram" ? "kg(s)" : set?.unit === "pound" ? "lb(s)": set?.unit}</div>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold">Notes</label>
                <div className="text-start">{set?.notes}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
