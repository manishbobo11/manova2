// Dynamic Sarthi system prompt builder
function buildSarthiPrompt({
  sessionLanguage,
  firstName,
  checkInSummary,
  emotionalHistory,
  lastTurns,
}: {
  sessionLanguage: string;
  firstName: string;
  checkInSummary: string;
  emotionalHistory: string;
  lastTurns: string;
}) {
  return `You are Sarthi — an empathetic, realistic AI friend + therapist.

LANGUAGE LOCK (CRITICAL)
• Reply ONLY in ${sessionLanguage}. Never switch mid-conversation.
• If user types in another language, reply in ${sessionLanguage} and ask once: "Do you want me to switch to ___?" — but do NOT auto-switch unless they explicitly say "yes, switch to ___."

CONVERSATION MEMORY
• USER: ${firstName}
• LATEST_CHECKIN: ${checkInSummary}
• EMOTIONAL_HISTORY (last 5):
${emotionalHistory}
• LAST_TURNS (most recent first):
${lastTurns}

RESPONSE STYLE
• Warm, human, culturally natural — no corporate or robotic tone
• Like a close friend who understands the problem and wants to solve it together
• Use plain language, avoid therapy clichés
• Use numbers/details from user input when possible (EMI, salary, tasks) to make advice practical

RESPONSE STRUCTURE (STRICT)
Keep it ≤ 180 words unless user asks for more.

1. VALIDATION (1–2 lines) — specific, personal, shows you understand their situation
2. ACTION STEPS (2–5 bullets) — concrete, realistic, doable today/this week
3. MICRO-PLAN (1 line) — "do this first now" — a prioritized immediate action
4. FOCUSED QUESTION — one specific question to continue the conversation (not open-ended)

CRISIS SAFETY
If you detect clear self-harm or crisis intent:
• Respond in ${sessionLanguage} with calm concern
• Encourage immediate help from a trusted person
• Suggest local emergency services
• In India, offer KIRAN Helpline 1800-599-0019 (free, confidential, 24/7)
• Keep it short, supportive, and practical

EXAMPLES (${sessionLanguage} style cues):

${sessionLanguage === "Hinglish" ? `"${firstName}, lagta hai dimaag par kaafi load chal raha hai. Chalo isse halka karte hain:
• Aaj 10-minute bina phone walk
• Kaam 25-minute ke chhote blocks me karo
• Raat ko 1 gratitude likho
Abhi pehla step: 10-minute walk ke baad mujhe ek line me feel batana
Kya main tumhare liye 3-step weekly plan bana du?"` : ""}

${sessionLanguage === "English" ? `"I hear you — this is a lot. Let's make it lighter:
• 5 minutes deep breathing before phone
• List just 2 must-dos for today; park the rest
• One small reward after you finish
First step now: write the 2 must-dos
Want me to draft a simple checklist?"` : ""}

${sessionLanguage === "Hindi" ? `"Samajh sakta hoon, yeh waqt bhaari lag raha hai. Chalo seedha kaam karte hain:
• Subah 5 minute saans par dhyaan
• Kaam ko chhote hisson me baant do
• Shaam 15 minute sirf apne liye
Pehla step: 5 minute saans — phir mujhe ek line me feel batao
Chaho to main ek easy plan bana doon?"` : ""}

Remember: Always reply only in ${sessionLanguage}, keep it practical + kind, and end with one focused question.`;
}

// Helper functions for data fetching
async function getLastMessages(userId: string, limit = 3) { 
  try { 
    return (await chatPersistence.getLastMessages(userId, limit)) ?? []; 
  } catch { 
    return []; 
  } 
}

async function getEmotionalHistory(userId: string) { 
  try { 
    return await vectorStore.getEmotionalHistory(userId); 
  } catch { 
    return []; 
  } 
}

async function getLatestCheckin(userId: string) { 
  try { 
    return await wellnessStore.getLatestCheckin(userId); 
  } catch { 
    return null; 
  } 
}

async function getUserProfile(userId: string) { 
  try { 
    return await userStore.getProfile(userId); 
  } catch { 
    return { firstName: "friend", languagePreference: "Hinglish" as const }; 
  } 
}

async function getSessionLanguage(userId: string): Promise<string | null> { 
  try { 
    return await chatSessionContext.getLanguage(userId); 
  } catch { 
    return null; 
  } 
}

async function buildSarthiContext(userId: string) {
  const [history, lastMsgs, latestCheckin, profile, sessionLang] = await Promise.all([
    getEmotionalHistory(userId),
    getLastMessages(userId, 3),
    getLatestCheckin(userId),
    getUserProfile(userId),
    getSessionLanguage(userId),
  ]);

  const lastTurns = (lastMsgs ?? [])
    .map((m: any) => `${m.role.toUpperCase()}: ${m.content}`)
    .join("\n");

  const historySummary =
    (history ?? [])
      .slice(-5)
      .map((h: any) => `${h.date || ""} • mood:${h.mood || "-"} • note:${h.note || "-"}`)
      .join("\n") || "no-emotional-history";

  const checkinSummary = latestCheckin
    ? `date:${latestCheckin.date || "-"}, score:${latestCheckin.score || "-"}, topDomains:${(latestCheckin.domains || []).join(", ") || "-"}`
    : "no-recent-checkin";

  return {
    profile,
    sessionLanguage: sessionLang || profile?.languagePreference || "Hinglish",
    firstName: profile?.firstName || "friend",
    checkInSummary: checkinSummary,
    emotionalHistory: historySummary,
    lastTurns: lastTurns || "no-last-messages",
  };
}

// Simple critic for "LLM-y"/wrong language responses
function looksGeneric(content: string) {
  const banned = [
    /as an ai/i,
    /language model/i,
    /i can(?:not|'t)/i,
    /i am unable/i,
    /i cannot provide/i,
    /i apologize/i,
    /sorry you're feeling that way/i,
  ];
  return banned.some((r) => r.test(content));
}
function wrongLanguage(lockedLang: string, content: string) {
  const hasDevanagari = /[ऀ-ॿ]/.test(content);
  const hasLatin = /[a-z]/i.test(content);
  if (lockedLang === "Hindi") return hasLatin && !hasDevanagari;
  if (lockedLang === "English") return hasDevanagari;
  if (lockedLang === "Hinglish") return !hasLatin; // must be Roman + simple Eng
  return false;
}

export async function generateSarthiReply({
  userId,
  userInput,
  azureClient,
  deployment,
  stream = false,
  uiLanguageChoice, // <- pass from UI if available
}: {
  userId: string;
  userInput: string;
  azureClient: any;
  deployment: string;
  stream?: boolean;
  uiLanguageChoice?: "English" | "Hindi" | "Hinglish";
}) {
  const context = await buildSarthiContext(userId);

  // 🔒 Language lock — UI choice overrides session language
  const sessionLanguage = uiLanguageChoice || context.sessionLanguage;

  // Build dynamic system prompt with all context
  const systemPrompt = buildSarthiPrompt({
    sessionLanguage,
    firstName: context.firstName,
    checkInSummary: context.checkInSummary,
    emotionalHistory: context.emotionalHistory,
    lastTurns: context.lastTurns,
  });

  const systemMessages = [
    { role: "system", content: systemPrompt },
  ];
  const userMessage = { role: "user", content: userInput };

  const GEN_OPTS = { temperature: 0.55, top_p: 0.9, max_tokens: 380, presence_penalty: 0.1 };

  // ---- Generate ----
  const call = async (extraSys?: string) => {
    const msgs = extraSys
      ? [...systemMessages, { role: "system", content: extraSys }, userMessage]
      : [...systemMessages, userMessage];

    return azureClient.chat.completions.create({
      model: deployment,
      messages: msgs,
      stream,
      ...GEN_OPTS,
    });
  };

  let response = await call();
  if (stream) return response;

  let content =
    response?.choices?.[0]?.message?.content?.trim() ||
    "I'm here. Can you tell me a bit more about what's on your mind?";

  // ---- Critic pass: fix generic/LLM-y or wrong-language replies ----
  if (looksGeneric(content) || wrongLanguage(sessionLanguage, content)) {
    const fixHint =
      sessionLanguage === "Hindi"
        ? "Regenerate ONLY in Hindi (Devanagari), short and practical. Avoid generic lines."
        : sessionLanguage === "English"
        ? "Regenerate ONLY in English, short and practical. Avoid generic filler."
        : "Regenerate ONLY in Hinglish (Roman Hindi + simple English), short and practical. Avoid generic filler.";

    const retry = await call(fixHint);
    content = retry?.choices?.[0]?.message?.content?.trim() || content;
  }

  return { content, raw: response, languageUsed: sessionLanguage };
}
