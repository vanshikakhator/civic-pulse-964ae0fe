export interface ClassificationResult {
  category: string;
  priority: "High" | "Medium" | "Low";
}

const HIGH_KEYWORDS = ["fire", "electric shock", "short circuit", "electrocution", "explosion", "collapse", "emergency", "danger", "hazard"];
const MEDIUM_KEYWORDS = ["garbage", "drain", "water leakage", "pothole", "sewage", "broken road", "flooding", "streetlight", "waste", "pollution", "noise", "crack"];

const CATEGORY_MAP: Record<string, string[]> = {
  "Fire & Safety": ["fire", "explosion", "smoke", "burn", "emergency"],
  "Electrical": ["electric", "shock", "short circuit", "wire", "electrocution", "power"],
  "Sanitation": ["garbage", "waste", "sewage", "drain", "trash", "dump", "pollution"],
  "Roads & Infrastructure": ["pothole", "road", "crack", "bridge", "broken", "footpath", "pavement"],
  "Water Supply": ["water", "leakage", "pipe", "flooding", "supply", "tap"],
  "Street Lighting": ["streetlight", "light", "lamp", "dark"],
  "Noise": ["noise", "loud", "disturbance", "honking"],
};

export function classifyComplaint(description: string): ClassificationResult {
  const lower = description.toLowerCase();

  // Determine priority
  let priority: "High" | "Medium" | "Low" = "Low";
  if (HIGH_KEYWORDS.some(k => lower.includes(k))) {
    priority = "High";
  } else if (MEDIUM_KEYWORDS.some(k => lower.includes(k))) {
    priority = "Medium";
  }

  // Determine category
  let category = "General";
  let maxScore = 0;
  for (const [cat, keywords] of Object.entries(CATEGORY_MAP)) {
    const score = keywords.filter(k => lower.includes(k)).length;
    if (score > maxScore) {
      maxScore = score;
      category = cat;
    }
  }

  return { category, priority };
}

export function getRiskLevel(totalComplaints: number, highPriorityCount: number): "High" | "Medium" | "Low" {
  if (totalComplaints > 10 || highPriorityCount > 3) return "High";
  if (totalComplaints > 5) return "Medium";
  return "Low";
}
