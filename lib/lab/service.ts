import { readFileSync, readdirSync, existsSync, statSync } from "fs";
import { join, resolve } from "path";
import type { LabStatus, NextAction, ResearchListItem } from "./types";

const RESEARCH_PATH = resolve(process.cwd(), "RESEARCH");

function readResearchDir(): string[] {
  try {
    if (!existsSync(RESEARCH_PATH)) return [];
    return readdirSync(RESEARCH_PATH)
      .filter((d) => d.startsWith("R-"))
      .sort()
      .reverse();
  } catch {
    return [];
  }
}

function readFileIfExists(...segments: string[]): string | null {
  try {
    const path = join(...segments);
    if (!existsSync(path)) return null;
    return readFileSync(path, "utf-8");
  } catch {
    return null;
  }
}

function extractTitle(readme: string): string {
  const firstLine = readme.split("\n")[0];
  return firstLine.replace(/^#\s*R-\d+:\s*/, "").trim() || "Sin título";
}

function extractStatus(readme: string): string {
  const match = readme.match(/##\s*Estado\s*\n([^\n]+)/);
  const val = match?.[1]?.trim();
  return val && val.length > 0 ? val : "En progreso";
}

function extractDecision(content: string): string {
  const match = content.match(/##\s*Decisión\s*\n([^\n]+)/);
  return match?.[1]?.trim() || "Sin decisión";
}

function extractDate(content: string): string {
  const match = content.match(/##\s*Fecha\s*\n([^\n]+)/);
  return match?.[1]?.trim() || "—";
}

function extractObjective(readme: string): string {
  const match = readme.match(/##\s*Objetivo\s*\n([^#\n]+)/);
  return match?.[1]?.trim() || "";
}

function listResearchFiles(researchId: string): ResearchListItem["files"] {
  const base = join(RESEARCH_PATH, researchId);
  try {
    const all = readdirSync(base).filter((f) => f.endsWith(".md"));
    return all.map((f) => ({ name: f.replace(".md", ""), path: join(researchId, f) }));
  } catch {
    return [];
  }
}

function getLastModified(researchId: string): string {
  const base = join(RESEARCH_PATH, researchId);
  try {
    const files = readdirSync(base)
      .filter((f) => f.endsWith(".md"))
      .map((f) => statSync(join(base, f)).mtime)
      .sort((a, b) => b.getTime() - a.getTime());
    if (files.length === 0) return "—";
    return files[0].toLocaleDateString("es-CL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

function inferPriority(id: string): ResearchListItem["priority"] {
  const num = Number.parseInt(id.replace("R-", ""), 10);
  if (num <= 1) return "alta";
  if (num <= 5) return "media";
  return "baja";
}

function inferProgress(researchId: string): string {
  const base = join(RESEARCH_PATH, researchId);
  const hasNotes = existsSync(join(base, "NOTES.md"));
  const hasSources = existsSync(join(base, "SOURCES.md"));
  const hasResults = existsSync(join(base, "RESULTS.md"));
  const hasDecision = existsSync(join(base, "DECISION.md"));

  if (hasDecision) return "Decisión tomada";
  if (hasResults) return "Analizando resultados";
  if (hasSources) return "Recolectando fuentes";
  if (hasNotes) return "En desarrollo";
  return "En progreso";
}

export class LabService {
  getLabStatus(): LabStatus {
    const dirs = readResearchDir();
    const active = dirs.length > 0 ? dirs[0] : null;

    let activeResearch: LabStatus["activeResearch"] = null;
    let lastDecision: LabStatus["lastDecision"] = null;

    if (active) {
      const readme = readFileIfExists(RESEARCH_PATH, active, "README.md");
      if (readme) {
        activeResearch = {
          id: active,
          title: extractTitle(readme),
          status: extractStatus(readme),
          progress: inferProgress(active),
        };
      }

      const decision = readFileIfExists(RESEARCH_PATH, active, "DECISION.md");
      if (decision) {
        lastDecision = {
          decision: extractDecision(decision),
          date: extractDate(decision),
          status: "Aprobada",
        };
      }
    }

    return {
      activeResearch,
      lastDecision,
      researchCount: dirs.length,
    };
  }

  listResearch(): ResearchListItem[] {
    const dirs = readResearchDir();
    return dirs.map((id) => {
      const readme = readFileIfExists(RESEARCH_PATH, id, "README.md");
      const decisionContent = readFileIfExists(RESEARCH_PATH, id, "DECISION.md");

      const title = readme ? extractTitle(readme) : "Sin título";
      const status = readme ? extractStatus(readme) : "—";
      const objective = readme ? extractObjective(readme) : "";
      const decision = decisionContent ? extractDecision(decisionContent) : "";
      const date = readme ? extractDate(readme) : "—";
      const progress = inferProgress(id);
      const priority = inferPriority(id);
      const lastModified = getLastModified(id);
      const files = listResearchFiles(id);

      return { id, title, status, objective, priority, date, lastModified, decision, progress, files };
    });
  }

  getNextAction(): NextAction {
    const dirs = readResearchDir();
    const active = dirs.length > 0 ? dirs[0] : null;

    if (!active) {
      return {
        label: "Iniciar primera investigación",
        description: "Crea un nuevo proyecto de investigación para empezar.",
        type: "research",
      };
    }

    const decision = readFileIfExists(RESEARCH_PATH, active, "DECISION.md");
    const readme = readFileIfExists(RESEARCH_PATH, active, "README.md");

    if (readme) {
      const title = extractTitle(readme);
      const isTemplate = title === "Sin título" || title.includes("[Título");

      if (isTemplate) {
        return {
          label: `Completar definición de ${active}`,
          description: "La investigación no tiene título ni objetivos definidos.",
          type: "research",
        };
      }
    }

    if (decision) {
      const summary = extractDecision(decision);
      return {
        label: `Continuar ${active}`,
        description: summary.replace(/\*\*/g, "").trim(),
        type: "research",
      };
    }

    return {
      label: `Continuar ${active}`,
      description: "Avanzar al siguiente paso del pipeline de investigación.",
      type: "research",
    };
  }
}
