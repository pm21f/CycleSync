import { PeriodFlowOption, SymptomOption, MoodOption } from "@/types";

export const FLOW_OPTIONS: PeriodFlowOption[] = [
  { value: "none", label: "None" },
  { value: "light", label: "Light" },
  { value: "medium", label: "Medium" },
  { value: "heavy", label: "Heavy" },
  { value: "spotting", label: "Spotting" }
];

export const SYMPTOM_OPTIONS: SymptomOption[] = [
  { id: "mood-swings", label: "Mood Swings", icon: "ri-emotion-happy-line" },
  { id: "cramps", label: "Cramps", icon: "ri-heart-pulse-line" },
  { id: "headache", label: "Headache", icon: "ri-mental-health-line" },
  { id: "fatigue", label: "Fatigue", icon: "ri-zzz-line" },
  { id: "bloating", label: "Bloating", icon: "ri-bubble-chart-line" },
  { id: "acne", label: "Acne", icon: "ri-eye-line" },
  { id: "discharge", label: "Discharge", icon: "ri-drop-line" },
  { id: "tender-breasts", label: "Tender Breasts", icon: "ri-temperature-hot-line" }
];

export const MOOD_OPTIONS: MoodOption[] = [
  { id: "happy", label: "Happy", emoji: "😊" },
  { id: "sad", label: "Sad", emoji: "😔" },
  { id: "irritable", label: "Irritable", emoji: "😠" },
  { id: "calm", label: "Calm", emoji: "😌" },
  { id: "tired", label: "Tired", emoji: "😴" },
  { id: "energetic", label: "Energetic", emoji: "🤩" }
];

export const INSIGHT_CATEGORIES = [
  { value: "all", label: "All Insights" },
  { value: "cycle", label: "Cycle Patterns" },
  { value: "symptoms", label: "Symptoms" },
  { value: "mood", label: "Mood Patterns" },
  { value: "fertility", label: "Fertility" }
];

export const RESOURCE_CATEGORIES = [
  { value: "all", label: "All Resources" },
  { value: "article", label: "Articles" },
  { value: "video", label: "Videos" },
  { value: "qa", label: "Q&A" }
];

export const MENSTRUAL_PHASES = [
  {
    id: "menstrual",
    name: "Menstrual Phase",
    description: "The phase when you're having your period. Your body sheds the uterine lining, causing bleeding.",
    days: "Days 1-5",
    tips: [
      "Stay hydrated to reduce bloating",
      "Try gentle exercise like walking to ease cramps",
      "Focus on iron-rich foods to replenish lost iron"
    ],
    color: "#E9638F"
  },
  {
    id: "follicular",
    name: "Follicular Phase",
    description: "Starts on day 1 of your period and ends with ovulation. Estrogen rises and an egg begins to mature.",
    days: "Days 1-13",
    tips: [
      "Great time for high-intensity workouts as energy levels rise",
      "Plan creative work as estrogen boosts cognitive function",
      "Focus on vitamin E foods to support follicle development"
    ],
    color: "#824B9C"
  },
  {
    id: "ovulatory",
    name: "Ovulatory Phase",
    description: "When your ovary releases a mature egg. Estrogen peaks and then drops after ovulation.",
    days: "Days 13-15",
    tips: [
      "Track cervical mucus changes to identify ovulation",
      "Schedule important meetings - your communication skills peak",
      "Take advantage of naturally high energy and confidence"
    ],
    color: "#FF9A8D"
  },
  {
    id: "luteal",
    name: "Luteal Phase",
    description: "After ovulation until your next period. Progesterone rises to prepare for potential pregnancy.",
    days: "Days 15-28",
    tips: [
      "Practice extra self-care as PMS symptoms may appear",
      "Focus on calcium-rich foods to reduce PMS symptoms",
      "Try magnesium supplements to ease mood changes and cramps"
    ],
    color: "#A17BFD"
  }
];
