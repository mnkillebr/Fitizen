// app/components/FitnessSettings.tsx
import { useEffect, useState } from "react";
import { Form } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Checkbox } from "~/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { AlertTriangle } from "lucide-react";
import { FitnessProfile } from "@prisma/client";

const FITNESS_GOALS = [
  { id: "fat-loss", label: "Fat Loss" },
  { id: "endurance", label: "Endurance" },
  { id: "build-muscle", label: "Build Muscle" },
  { id: "lose-weight", label: "Lose Weight" },
  { id: "improve-balance", label: "Improve Balance" },
  { id: "improve-flexibility", label: "Improve Flexibility" },
  { id: "learn-new-skills", label: "Learn New Skills" },
] as const;

const PARQ_QUESTIONS = [
  {
    id: "heart-condition",
    question: "Has your doctor ever said that you have a heart condition and that you should only perform physical activity recommended by a doctor?"
  },
  {
    id: "chest-pain-activity",
    question: "Do you feel pain in your chest when you perform physical activity?"
  },
  {
    id: "chest-pain-no-activity",
    question: "In the past month, have you had chest pain when you were not performing any physical activity?"
  },
  {
    id: "balance-consciousness",
    question: "Do you lose your balance because of dizziness or do you ever lose consciousness?"
  },
  {
    id: "bone-joint",
    question: "Do you have a bone or joint problem that could be made worse by a change in your physical activity?"
  },
  {
    id: "blood-pressure-meds",
    question: "Is your doctor currently prescribing any medication for your blood pressure or for a heart condition?"
  },
  {
    id: "other-reasons",
    question: "Do you know of any other reason why you should not engage in physical activity?"
  }
];

const GENERAL_HISTORY = {
  occupational: [
    {
      id: "extended-sitting",
      question: "Does your occupation require extended periods of sitting?"
    },
    {
      id: "repetitive-movements",
      question: "Does your occupation require repetitive movements?"
    },
    {
      id: "heel-shoes",
      question: "Does your occupation require you to wear shoes with a heel (e.g., dress shoes)?"
    },
    {
      id: "mental-stress",
      question: "Does your occupation cause you mental stress?"
    }
  ],
  recreational: [
    {
      id: "physical-activities",
      question: "Do you partake in any recreational physical activities (golf, skiing, etc.)?"
    },
    {
      id: "hobbies",
      question: "Do you have any additional hobbies (reading, video games, etc.)?"
    }
  ],
  medical: [
    {
      id: "injuries-pain",
      question: "Have you ever had any injuries or chronic pain?"
    },
    {
      id: "surgeries",
      question: "Have you ever had any surgeries?"
    },
    {
      id: "chronic-disease",
      question: "Has a medical doctor ever diagnosed you with a chronic disease, such as heart disease, hypertension, high cholesterol, or diabetes?"
    },
    {
      id: "medications",
      question: "Are you currently taking any medication?"
    }
  ]
};

const skipExplanationIds = ["extended-sitting", "heel-shoes", "mental-stress"]

export function FitnessSettings({ fitnessProfile }: { fitnessProfile: FitnessProfile}) {
  const incomingFitnessGoals = Object.entries(fitnessProfile).reduce((result: string[], curr) => {
    let resultArr = result
    const [key, value] = curr
    if (key.includes("goal") && value) {
      const goal = key.split("_")[1].replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
      resultArr = resultArr.concat(goal)
    }
    return resultArr
  }, [])
  const incomingParQAnswers = Object.entries(fitnessProfile).reduce((result: {[key: string]: boolean;}, curr) => {
    let resultObj = result
    const [key, value] = curr
    if (key.includes("parq")) {
      const parq = key.split("_")[1].replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
      if (value) {
        resultObj[parq] = true
      } else if (value === false) {
        resultObj[parq] = false
      }
    }
    return resultObj
  }, {})
  const incomingHistoryAnswers = Object.entries(fitnessProfile).reduce((result: {[key: string]: any;}, curr) => {
    let resultObj = result
    const [key, value] = curr
    if (key.includes("explanation")) {
      const historyKey = key.split("_")[2].replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
      resultObj[historyKey] = {
        answer: value && value !== "" ? true : false,
        explanation: value ?? "",
      }
    } else if (key.includes("operational" || "recreational" || "medical")) {
      const historyKey = key.split("_")[1].replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
      resultObj[historyKey] = {
        ...resultObj[historyKey],
        answer: value,
      }
    }
    return resultObj
  }, {})

  const [selectedUnit, setSelectedUnit] = useState<"lbs" | "kg">("lbs");
  const [selectedHeightUnit, setSelectedHeightUnit] = useState<"in" | "cm">("in");
  const [height, setHeight] = useState(fitnessProfile.height ?? "")
  const [selectedGoals, setSelectedGoals] = useState<string[]>(incomingFitnessGoals ?? []);
  const [parqAnswers, setParqAnswers] = useState<Record<string, boolean>>(incomingParQAnswers ?? {});
  const [weights, setWeights] = useState({
    current: fitnessProfile.currentWeight ?? "",
    target: fitnessProfile.targetWeight ?? ""
  });
  const [historyAnswers, setHistoryAnswers] = useState<Record<string, { answer: boolean; explanation?: string }>>(incomingHistoryAnswers ?? {});
  const [occupation, setOccupation] = useState(fitnessProfile.operational_occupation ?? "");
  const [showParqWarning, setShowParqWarning] = useState(false);

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals(current => 
      current.includes(goalId)
        ? current.filter(id => id !== goalId)
        : [...current, goalId]
    );
  };

  useEffect(() => {
    const hasYesAnswers = Object.values(parqAnswers).some(answer => answer === true);
    setShowParqWarning(hasYesAnswers);
  }, [parqAnswers]);

  const handleHistoryAnswer = (id: string, value: boolean) => {
    setHistoryAnswers(prev => ({
      ...prev,
      [id]: { 
        answer: value, 
        explanation: prev[id]?.explanation || "" 
      }
    }));
  };

  const handleExplanationChange = (id: string, explanation: string) => {
    setHistoryAnswers(prev => ({
      ...prev,
      [id]: { 
        ...prev[id],
        explanation 
      }
    }));
  };

  const renderHistorySection = (
    title: string, 
    questions: { id: string; question: string }[]
  ) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      {questions.map(({ id, question }) => (
        <div key={id} className="space-y-2">
          <Label className="text-base">{question}</Label>
          <RadioGroup
            value={historyAnswers[id]?.answer?.toString()}
            onValueChange={(value) => handleHistoryAnswer(id, value === "true")}
            className="flex space-x-4"
            name={id}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="true" id={`${id}-yes`} />
              <Label htmlFor={`${id}-yes`}>Yes</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="false" id={`${id}-no`} />
              <Label htmlFor={`${id}-no`}>No</Label>
            </div>
          </RadioGroup>
          
          {historyAnswers[id]?.answer && !skipExplanationIds.includes(id) && (
            <Textarea
              placeholder="Please provide details..."
              value={historyAnswers[id]?.explanation}
              onChange={(e) => handleExplanationChange(id, e.target.value)}
              className="mt-2"
              name={`explanation_${id}`}
            />
          )}
          <Separator className="mt-4" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Height Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Height</CardTitle>
          <CardDescription>
            Set your height
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <RadioGroup
              defaultValue={selectedHeightUnit}
              onValueChange={(value) => setSelectedHeightUnit(value as "in" | "cm")}
              className="flex space-x-4"
              name="heightUnit"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="in" id="in" />
                <Label htmlFor="in">Inches (in)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cm" id="cm" />
                <Label htmlFor="cm">Centimeters (cm)</Label>
              </div>
            </RadioGroup>

            <div className="space-y-2 sm:w-1/2">
              <Label htmlFor="user-height">Height</Label>
              <Input
                id="user-height"
                name="userHeight"
                type="number"
                min="0"
                step="1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder={`Enter height in ${selectedHeightUnit === "in" ? "inches" : "centimeters"}`}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weight Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Weight Goals</CardTitle>
          <CardDescription>
            Set your current and target weights
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <RadioGroup
              defaultValue={selectedUnit}
              onValueChange={(value) => setSelectedUnit(value as "lbs" | "kg")}
              className="flex space-x-4"
              name="unit"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="lbs" id="lbs" />
                <Label htmlFor="lbs">Pounds (lbs)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="kg" id="kg" />
                <Label htmlFor="kg">Kilograms (kg)</Label>
              </div>
            </RadioGroup>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current-weight">Current Weight</Label>
                <Input
                  id="current-weight"
                  name="currentWeight"
                  type="number"
                  min="0"
                  step="0.1"
                  value={weights.current}
                  onChange={(e) => setWeights(prev => ({ ...prev, current: e.target.value }))}
                  placeholder={`Enter weight in ${selectedUnit}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target-weight">Target Weight</Label>
                <Input
                  id="target-weight"
                  name="targetWeight"
                  type="number"
                  min="0"
                  step="0.1"
                  value={weights.target}
                  onChange={(e) => setWeights(prev => ({ ...prev, target: e.target.value }))}
                  placeholder={`Enter weight in ${selectedUnit}`}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fitness Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Fitness Goals</CardTitle>
          <CardDescription>
            Select one or more fitness goals you'd like to achieve
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {FITNESS_GOALS.map(({ id, label }) => (
              <div key={id} className="flex items-center space-x-2">
                <Checkbox
                  id={id}
                  name={id}
                  checked={selectedGoals.includes(id)}
                  onCheckedChange={() => handleGoalToggle(id)}
                />
                <Label htmlFor={id}>{label}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* PAR-Q Form */}
      <Card>
        <CardHeader>
          <CardTitle>Physical Activity Readiness Questionnaire (PAR-Q)</CardTitle>
          <CardDescription>
            Please answer the following questions honestly and accurately
          </CardDescription>
        </CardHeader>
        <CardContent>
          {showParqWarning && (
            <Alert variant="destructive" className="mb-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Medical Consultation Required</AlertTitle>
              <AlertDescription>
                You've answered YES to one or more PAR-Q questions. Please consult your physician
                before engaging in physical activity. Show your physician which questions you
                answered YES to and follow their advice on what type of activity is suitable
                for your current condition.
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-6">
            {PARQ_QUESTIONS.map(({ id, question }) => (
              <div key={id} className="space-y-2">
                <Label className="text-base">{question}</Label>
                <RadioGroup
                  value={parqAnswers[id]?.toString()}
                  onValueChange={(value) => 
                    setParqAnswers(prev => ({
                      ...prev,
                      [id]: value === "true"
                    }))
                  }
                  name={id}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="true" id={`${id}-yes`} />
                    <Label htmlFor={`${id}-yes`}>Yes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="false" id={`${id}-no`} />
                    <Label htmlFor={`${id}-no`}>No</Label>
                  </div>
                </RadioGroup>
                <Separator className="mt-4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* General and Medical History */}
      <Card>
        <CardHeader>
          <CardTitle>General and Medical History</CardTitle>
          <CardDescription>
            Please provide information about your occupation, recreational activities, and medical history
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-4">
            <Label htmlFor="occupation" className="text-lg font-semibold">
              What is your current occupation?
            </Label>
            <Input
              id="occupation"
              name="occupation"
              autoComplete="off"
              value={occupation}
              onChange={(e) => setOccupation(e.target.value)}
              placeholder="Enter your current occupation"
            />
          </div>
          
          {renderHistorySection("Occupational", GENERAL_HISTORY.occupational)}
          <Separator className="my-6" />
          
          {renderHistorySection("Recreational", GENERAL_HISTORY.recreational)}
          <Separator className="my-6" />
          
          {renderHistorySection("Medical", GENERAL_HISTORY.medical)}
        </CardContent>
      </Card>

      {/* <div className="flex justify-end">
        <Button
          type="submit"
          name="_action"
          value="updateFitnessProfile"
        >
          Save Fitness Profile
        </Button>
      </div> */}
    </div>
  );
}