import { saveSurveyToVectorDB } from "../memory/vectorStore.js";

// This function saves user stress triggers to vector memory
export const saveStressTriggersToMemory = async ({
  userId,
  domain,
  selectedTriggers, // array of selected options
  customInputText = "", // optional extra input
}) => {
  try {
    const combinedText = selectedTriggers.join(", ");
    const fullMemoryText = `In the ${domain} domain, user reported stress due to: ${combinedText}. ${customInputText}`;

    await saveSurveyToVectorDB({
      userId,
      domain,
      text: fullMemoryText,
    });

    console.log("✅ Saved to memory:", fullMemoryText);
  } catch (error) {
    console.error("❌ Memory save failed:", error);
  }
}; 