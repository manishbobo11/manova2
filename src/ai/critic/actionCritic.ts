/**
 * ActionCritic: flags responses that are empathy-only or too vague.
 * If below thresholds, caller should regenerate with a stronger instruction.
 */
export function isActionWeak(response: string) {
  const text = response.toLowerCase();

  // Count bullets / imperative cues
  const bulletCount = (response.match(/^-|\u2022|\*/gm) || []).length;
  const imperativeVerbs = (text.match(/\b(do|make|write|list|set|plan|walk|breathe|call|schedule|pack|review|limit|cap|focus|break|start|finish|prepare|apply)\b/g) || []).length;

  // Penalize typical vague phrases
  const vagueHits = (text.match(/\b(i understand|you're not alone|this is tough|take a deep breath\b(?! after))/g) || []).length;

  const tooLong = response.length > 1200; // defensive

  const passes =
    bulletCount >= 2 &&
    imperativeVerbs >= 3 &&
    vagueHits <= 2 &&
    !tooLong;

  return { ok: passes, bulletCount, imperativeVerbs, vagueHits, tooLong };
}

export function buildRegenerateInstruction(lang: "English" | "Hindi" | "Hinglish") {
  const base =
    `Your previous answer was too generic. Regenerate with **2–6 concrete, time‑boxed action steps** tied to the user's situation. ` +
    `Avoid open questions; assume defaults and propose a plan. Keep it under ~160–180 words.`;

  if (lang === "Hindi") return base + ` Reply ONLY in Hindi (Devanagari).`;
  if (lang === "Hinglish") return base + ` Reply ONLY in Hinglish (Roman Hindi + English).`;
  return base + ` Reply ONLY in English.`;
}
