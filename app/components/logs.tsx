import MuxPlayer from '@mux/mux-player-react';
import { Video } from 'lucide-react';
import { Input } from '~/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '~/components/ui/select';
import { useOpenDialog } from './Dialog';

type ExerciseItemType = {
  id: string;
  target: string;
  reps: string;
  name: string;
  time: string;
  notes: string;
  sets: string;
  muxPlaybackId: string;
  videoToken: string;
  cues: string[];
}

interface CircuitLogProps {
  item: {
    exercises: Array<ExerciseItemType>;
    circuitId: string;
  };
  index: number;
  unitOptions: { value: string; label: string; }[];
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
  unitOptions: { value: string; label: string; }[];
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
  const openDialog = useOpenDialog();
  return (
    <div key={`${item.circuitId}-${index}`} className="flex flex-col">
      <div className="flex gap-x-1 flex-nowrap">
        <div className="flex-none font-semibold w-28">{`Circuit #${exerciseDetails.filter(e => e.exercises).findIndex(e => e.circuitId === item.circuitId) + 1}:`}</div>
      </div>
      <div className="border-2 border-dashed border-gray-200 p-2 rounded shadow-inner flex flex-col gap-y-2">
        {[...Array(parseInt(numSets))].map((set: unknown, idx: number) =>
          <div key={`${index}-${idx}`} className="border rounded dark:border-none dark:shadow-sm dark:shadow-border-muted">
            {item.exercises.map((ex_item: ExerciseItemType, ex_idx: number) => {
              const currentSet = idx + 1
              const exerciseIndex = flatDetails.findIndex((d: { id: string }) => d.id === ex_item.id)
              return (
                <div key={`${idx}-${ex_idx}`} className="bg-slate-100 dark:bg-background px-2 py-1 rounded">
                  {ex_idx === 0 ? <div className="tex-base font-semibold">{`Set ${currentSet}`}</div> : null}
                  <input type="hidden" name={`exercises[${exerciseIndex}].circuitId`} value={item.circuitId} />
                  <input type="hidden" name={`exercises[${exerciseIndex}].exerciseId`} value={ex_item.id} />
                  <input type="hidden" name={`exercises[${exerciseIndex}].target`} value={ex_item.target} />
                  <input type="hidden" name={`exercises[${exerciseIndex}].targetReps`} value={ex_item?.reps} />
                  <input type="hidden" name={`exercises[${exerciseIndex}].time`} value={ex_item?.time} />
                  <input type="hidden" name={`exercises[${exerciseIndex}].sets[${idx}].set`} value={currentSet} />
                  <div className="flex flex-wrap gap-x-3">
                    <div className="flex flex-col w-full sm:w-56 truncate">
                      <label className="text-xs font-semibold text-muted-foreground">Name</label>
                      <div>{ex_item.name}</div>
                    </div>
                    {currentSet === 1 ? (
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold text-muted-foreground">Video</label>
                        <Video
                          className="hover:cursor-pointer min-w-6"
                          onClick={() => openDialog(
                            <div className="flex flex-col md:flex-row gap-y-3 gap-x-4">
                              <div className="w-full">
                                <MuxPlayer
                                  streamType="on-demand"
                                  playbackId={ex_item.muxPlaybackId ? ex_item.muxPlaybackId : undefined}
                                  tokens={{ playback: ex_item.videoToken, thumbnail: ex_item.videoToken }}
                                  metadataVideoTitle="Placeholder (optional)"
                                  metadataViewerUserId="Placeholder (optional)"
                                  primaryColor="#FFFFFF"
                                  secondaryColor="#000000"
                                  style={{
                                    aspectRatio: 9/16,
                                    width: "100%",
                                    height: "100%",
                                    maxHeight: 640,
                                    maxWidth: 360,
                                  }}
                                />
                              </div>
                              <div className="w-full">
                                <div className="font-bold mb-2">Cues</div>
                                <div className="flex-1">{ex_item.cues.map((cue, cue_idx) => (
                                  <div key={cue_idx} className="flex w-full">
                                    <div className="flex-none w-5">{cue_idx+1}.</div>
                                    <div className="flex-1">{cue}</div>
                                  </div>
                                ))}</div>
                              </div>
                            </div>, ex_item.name
                          )}
                        />
                      </div>
                    ) : null}
                    {ex_item.target === "reps" ? (
                      <>
                        <div className="flex flex-col">
                          <label className="text-xs font-semibold text-muted-foreground">Target Reps</label>
                          <div className="text-start text-sm">{ex_item?.reps}</div>
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-semibold text-muted-foreground">Actual Reps</label>
                          <Input
                            type="number"
                            className="w-13 text-sm h-5 pr-1 bg-background dark:border-border-muted"
                            name={`exercises[${exerciseIndex}].sets[${idx}].actualReps`}
                            placeholder={ex_item?.reps}
                            min={1}
                            max={999}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col">
                        <label className="text-xs font-semibold capitalize text-muted-foreground">Time</label>
                        <div className="text-start text-sm">{ex_item?.time}</div>
                      </div>
                    )}
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold text-muted-foreground">Load</label>
                      <Input
                        type="number"
                        className="w-13 text-sm h-5 pr-1 bg-background dark:border-border-muted"
                        name={`exercises[${exerciseIndex}].sets[${idx}].load`}
                        min={0}
                        max={999}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold text-muted-foreground">Load Units</label>
                      {/* <select
                        defaultValue="lb(s)"
                        name={`exercises[${exerciseIndex}].sets[${idx}].unit`}
                      >
                        {unitOptions.map((unit, unit_idx) => <option key={unit_idx}>{unit}</option>)}
                      </select> */}
                      <Select
                        defaultValue="lb(s)"
                        name={`exercises[${exerciseIndex}].sets[${idx}].unit`}
                      >
                        <SelectTrigger className="text-xs h-5 bg-background dark:border-border-muted">
                          <SelectValue placeholder="Select Units" />
                        </SelectTrigger>
                        <SelectContent className="dark:border-border-muted">
                          <SelectGroup>
                            <SelectLabel>Load Unit</SelectLabel>
                            {unitOptions.map((unit, unit_idx) => <SelectItem key={unit_idx} value={unit.value}>{unit.label}</SelectItem>)}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col">
                      <label className="text-xs font-semibold text-muted-foreground">Notes</label>
                      <Input
                        type="text"
                        className="w-36 text-sm px-2 h-5 self-end bg-background dark:border-border-muted"
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
  const openDialog = useOpenDialog();
  return (
    <div key={`${item.name}-${index}`} className="flex flex-col">
      <div className="flex gap-x-1 flex-nowrap">
        <div className="flex-none font-semibold w-28">{`Exercise #${exerciseDetails.filter(e => !e.exercises).findIndex(e => e.id === item.id) + 1}:`}</div>
        <div className="max-w-60 truncate">{item.name}</div>
        <Video
          className="hover:cursor-pointer min-w-6 ml-4"
          onClick={() => openDialog(
            <div className="flex flex-col md:flex-row gap-y-3 gap-x-4">
              <div className="w-full">
                <MuxPlayer
                  streamType="on-demand"
                  playbackId={item.muxPlaybackId ? item.muxPlaybackId : undefined}
                  tokens={{ playback: item.videoToken, thumbnail: item.videoToken }}
                  metadataVideoTitle="Placeholder (optional)"
                  metadataViewerUserId="Placeholder (optional)"
                  primaryColor="#FFFFFF"
                  secondaryColor="#000000"
                  style={{
                    aspectRatio: 9/16,
                    width: "100%",
                    height: "100%",
                    maxHeight: 640,
                    maxWidth: 360,
                  }}
                />
              </div>
              <div className="w-full">
                <div className="font-bold mb-2">Cues</div>
                <div className="flex-1">{item.cues.map((cue, cue_idx) => (
                  <div key={cue_idx} className="flex w-full">
                    <div className="flex-none w-5">{cue_idx+1}.</div>
                    <div className="flex-1">{cue}</div>
                  </div>
                ))}</div>
              </div>
            </div>, item.name
          )}
        />
      </div>
      <div className="flex flex-col gap-y-2 p-2">
        {[...Array(parseInt(item.sets))].map((set: unknown, idx: number) => {
          const currentSet = idx + 1
          const exerciseIndex = flatDetails.findIndex((d: { id: string }) => d.id === item.id)
          return (
            <div key={idx} className="flex flex-wrap gap-x-3 items-center bg-slate-100 dark:bg-background dark:border-none dark:shadow-sm dark:shadow-border-muted px-2 py-1 rounded border">
              <div className="w-full sm:w-16 font-semibold">{`Set ${currentSet}`}</div>
              <input type="hidden" name={`exercises[${exerciseIndex}].exerciseId`} value={item.id} />
              <input type="hidden" name={`exercises[${exerciseIndex}].target`} value={item.target} />
              <input type="hidden" name={`exercises[${exerciseIndex}].targetReps`} value={item?.reps} />
              <input type="hidden" name={`exercises[${exerciseIndex}].time`} value={item?.time} />
              <input type="hidden" name={`exercises[${exerciseIndex}].sets[${idx}].set`} value={currentSet} />
              {item.target === "reps" ? (
                <>
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-muted-foreground">Target Reps</label>
                    <div className="text-start text-sm">{item?.reps}</div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-muted-foreground">Actual Reps</label>
                    <Input
                      type="number"
                      className="w-13 text-sm h-5 pr-1 bg-background dark:border-border-muted"
                      name={`exercises[${exerciseIndex}].sets[${idx}].actualReps`}
                      placeholder={item?.reps}
                      min={1}
                      max={999}
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col">
                  <label className="text-xs font-semibold capitalize text-muted-foreground">Time</label>
                  <div className="text-start text-sm">{item?.time}</div>
                </div>
              )}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-muted-foreground">Load</label>
                <Input
                  type="number"
                  className="w-13 text-sm h-5 pr-1 bg-background dark:border-border-muted"
                  name={`exercises[${exerciseIndex}].sets[${idx}].load`}
                  min={0}
                  max={999}
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-muted-foreground">Load Units</label>
                {/* <select
                  defaultValue="lb(s)"
                  name={`exercises[${exerciseIndex}].sets[${idx}].unit`}
                >
                  {unitOptions.map((unit, unit_idx) => <option key={unit_idx}>{unit}</option>)}
                </select> */}
                <Select
                  defaultValue="lb(s)"
                  name={`exercises[${exerciseIndex}].sets[${idx}].unit`}
                >
                  <SelectTrigger className="text-xs h-5 bg-background dark:border-border-muted">
                    <SelectValue placeholder="Select Units" />
                  </SelectTrigger>
                  <SelectContent className="dark:border-border-muted">
                    <SelectGroup>
                      <SelectLabel>Load Unit</SelectLabel>
                      {unitOptions.map((unit, unit_idx) => <SelectItem key={unit_idx} value={unit.value}>{unit.label}</SelectItem>)}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-muted-foreground">Notes</label>
                <Input
                  type="text"
                  className="w-36 text-sm px-2 h-5 self-end bg-background dark:border-border-muted"
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
      <div className="border-2 border-dashed border-gray-200 p-2 rounded shadow-inner flex flex-col gap-y-2">
        {exercise.sets.map((set: SetType, idx: number) =>
          <div key={`${index}-${idx}`} className="border rounded bg-slate-100 dark:border-none dark:bg-background dark:shadow-sm dark:shadow-border-muted px-2 py-1">
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
                    <label className="text-xs font-semibold text-muted-foreground">Target Reps</label>
                    <div className="text-start">{set?.targetReps}</div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-muted-foreground">Actual Reps</label>
                    <div className="text-start">{set?.actualReps}</div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col">
                  <label className="text-xs font-semibold capitalize text-muted-foreground">Time</label>
                  <div className="text-start">{set?.time}</div>
                </div>
              )}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-muted-foreground">Load</label>
                <div className="text-start">{set?.load}</div>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-muted-foreground">Load Units</label>
                <div className="text-start">{set?.unit === "kilogram" ? "kg(s)" : set?.unit === "pound" ? "lb(s)": set?.unit}</div>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-muted-foreground">Notes</label>
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
      <div className="rounded shadow-inner flex flex-col gap-y-2">
        {exercise.sets.map((set: SetType, idx: number) =>
          <div key={`${index}-${idx}`} className="border rounded bg-slate-100 dark:border-none dark:bg-background dark:shadow-sm dark:shadow-border-muted px-2 py-1">
            <div className="text-base font-semibold mb-1">{`Set ${set.set}`}</div>
            <div className="flex flex-wrap gap-x-6">
              {exercise.target === "reps" ? (
                <>
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-muted-foreground">Target Reps</label>
                    <div className="text-start">{exercise?.targetReps}</div>
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-muted-foreground">Actual Reps</label>
                    <div className="text-start">{set?.actualReps}</div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col">
                  <label className="text-xs font-semibold capitalize text-muted-foreground">Time</label>
                  <div className="text-start">{exercise?.time}</div>
                </div>
              )}
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-muted-foreground">Load</label>
                <div className="text-start">{set?.load}</div>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-muted-foreground">Load Units</label>
                <div className="text-start">{set?.unit === "kilogram" ? "kg(s)" : set?.unit === "pound" ? "lb(s)": set?.unit}</div>
              </div>
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-muted-foreground">Notes</label>
                <div className="text-start">{set?.notes}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
