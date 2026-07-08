import { readFileSync, readdirSync, existsSync, statSync } from "fs";
import { join, resolve } from "path";
import type { ResearchProject } from "./types";

const RESEARCH_PATH = resolve(process.cwd(), "RESEARCH");

function readFile(base: string, ...segments: string[]): string | null {
  try {
    const path = join(base, ...segments);
    if (!existsSync(path)) return null;
    return readFileSync(path, "utf-8");
  } catch {
    return null;
  }
}

function extractSection(content: string, heading: string): string | null {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`##\\s*${escaped}\\s*\\n([\\s\\S]*?)(?=\\n##\\s|\\n*$)`);
  const match = content.match(regex);
  if (!match) return null;
  const trimmed = match[1].trim();
  return trimmed.length > 0 ? trimmed : null;
}

function extractTitle(readme: string): string {
  const firstLine = readme.split("\n")[0];
  return firstLine.replace(/^#\s*R-\d+:\s*/, "").trim() || "Sin título";
}

function getLastModified(id: string): string {
  const base = join(RESEARCH_PATH, id);
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

function inferProgress(id: string): string {
  const base = join(RESEARCH_PATH, id);
  const hasDecision = existsSync(join(base, "DECISION.md"));
  const hasResults = existsSync(join(base, "RESULTS.md"));
  const hasSources = existsSync(join(base, "SOURCES.md"));
  const hasNotes = existsSync(join(base, "NOTES.md"));

  if (hasDecision) return "Decisión tomada";
  if (hasResults) return "Analizando resultados";
  if (hasSources) return "Recolectando fuentes";
  if (hasNotes) return "En desarrollo";
  return "En progreso";
}

function readResearchDirs(): string[] {
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

export class ResearchService {
  list(): ResearchProject[] {
    const dirs = readResearchDirs();
    return dirs.map((id) => this.readProject(id)).filter(Boolean) as ResearchProject[];
  }

  getById(id: string): ResearchProject | null {
    const dirs = readResearchDirs();
    if (!dirs.includes(id)) return null;
    return this.readProject(id);
  }

  private readProject(id: string): ResearchProject | null {
    const base = join(RESEARCH_PATH, id);
    if (!existsSync(base)) return null;

    const readme = readFile(RESEARCH_PATH, id, "README.md");
    const decisionMd = readFile(RESEARCH_PATH, id, "DECISION.md");
    const resultsMd = readFile(RESEARCH_PATH, id, "RESULTS.md");
    const hypothesisMd = readFile(RESEARCH_PATH, id, "HYPOTHESIS.md");
    const evidenceMd = readFile(RESEARCH_PATH, id, "EVIDENCE.md");
    const conclusionMd = readFile(RESEARCH_PATH, id, "CONCLUSION.md");
    const actionsMd = readFile(RESEARCH_PATH, id, "ACTIONS.md");

    const title = readme ? extractTitle(readme) : "Sin título";
    const status = readme ? extractSection(readme, "Estado") || "En progreso" : "—";
    const objective = readme ? extractSection(readme, "Objetivo") : null;
    const decision = decisionMd ? extractSection(decisionMd, "Decisión") : null;
    const hypothesis =
      hypothesisMd ?? (readme ? extractSection(readme, "Hipótesis") : null);
    const evidence = evidenceMd ?? (resultsMd ?? null);
    const conclusion =
      conclusionMd ?? (resultsMd ? extractSection(resultsMd, "Conclusión") : null);
    const actions =
      actionsMd ?? (readme ? extractSection(readme, "Acciones") : null);

    const lastModified = getLastModified(id);
    const progress = inferProgress(id);

    return {
      id, title, status, objective, hypothesis, evidence, conclusion,
      decision, actions, lastModified, progress,
    };
  }
}

export { RESEARCH_PATH };
