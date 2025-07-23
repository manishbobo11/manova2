import { analyzeStress } from "../src/services/ai/manovaAgent.js";

(async () => {
  const result = await analyzeStress({
    question: "How are things going at home?",
    answer: "I feel mentally tired. Things are not getting better."
  });

  console.log("🧠 AI Stress Analysis:", result);
})();
