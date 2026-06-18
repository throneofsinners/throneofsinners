// Keyword-based crisis detection. Conservative — false positives are acceptable;
// a flagged submission is reviewed by safeguarding, never dismissed publicly.
const PATTERNS: { keyword: string; category: string }[] = [
  // Self-harm / suicide
  { keyword: "kill myself", category: "self_harm" },
  { keyword: "killing myself", category: "self_harm" },
  { keyword: "end my life", category: "self_harm" },
  { keyword: "ending my life", category: "self_harm" },
  { keyword: "want to die", category: "self_harm" },
  { keyword: "wanna die", category: "self_harm" },
  { keyword: "suicide", category: "self_harm" },
  { keyword: "suicidal", category: "self_harm" },
  { keyword: "take my own life", category: "self_harm" },
  { keyword: "no reason to live", category: "self_harm" },
  { keyword: "cut myself", category: "self_harm" },
  { keyword: "cutting myself", category: "self_harm" },
  { keyword: "self harm", category: "self_harm" },
  { keyword: "self-harm", category: "self_harm" },
  { keyword: "overdose", category: "self_harm" },

  // Abuse / domestic violence
  { keyword: "abused", category: "abuse" },
  { keyword: "abusing me", category: "abuse" },
  { keyword: "he hits me", category: "abuse" },
  { keyword: "she hits me", category: "abuse" },
  { keyword: "they hit me", category: "abuse" },
  { keyword: "beats me", category: "abuse" },
  { keyword: "domestic violence", category: "abuse" },
  { keyword: "rape", category: "abuse" },
  { keyword: "raped", category: "abuse" },
  { keyword: "assaulted", category: "abuse" },

  // Child safeguarding
  { keyword: "child abuse", category: "safeguarding" },
  { keyword: "abusing a child", category: "safeguarding" },
  { keyword: "molested", category: "safeguarding" },
  { keyword: "inappropriate with a child", category: "safeguarding" },
  { keyword: "minor", category: "safeguarding" },

  // Threats
  { keyword: "kill him", category: "threat" },
  { keyword: "kill her", category: "threat" },
  { keyword: "kill them", category: "threat" },
  { keyword: "hurt them", category: "threat" },
  { keyword: "going to hurt", category: "threat" },
];

export type RiskScan = {
  flagged: boolean;
  matched: string[];
  categories: string[];
};

export function scanForRisk(text: string): RiskScan {
  const lower = text.toLowerCase();
  const matched: string[] = [];
  const categories = new Set<string>();
  for (const { keyword, category } of PATTERNS) {
    if (lower.includes(keyword)) {
      matched.push(keyword);
      categories.add(category);
    }
  }
  return { flagged: matched.length > 0, matched, categories: [...categories] };
}
