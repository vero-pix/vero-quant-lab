import { readFileSync, readdirSync, existsSync } from "fs";
import { join, resolve } from "path";
import type { AcademyModule, AcademyLesson } from "./types";

const ACADEMY_PATH = resolve(process.cwd(), "ACADEMY");

function readFileContent(...segments: string[]): string | null {
  try {
    const path = join(...segments);
    if (!existsSync(path)) return null;
    return readFileSync(path, "utf-8");
  } catch {
    return null;
  }
}

function extractField(content: string, field: string): string {
  const regex = new RegExp(`##\\s*${field}\\s*\\n([^\\n]+)`);
  const match = content.match(regex);
  return match?.[1]?.trim() || "—";
}

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)/m);
  return match?.[1]?.trim() || "Sin título";
}

function extractDescription(content: string): string {
  const lines = content.split("\n");
  const body: string[] = [];
  let inBody = false;
  for (const line of lines) {
    if (line.startsWith("# ")) continue;
    if (line.startsWith("## ")) break;
    if (line.trim()) {
      inBody = true;
      body.push(line.trim());
    } else if (inBody) {
      break;
    }
  }
  return body.join(" ").trim() || "";
}

function lessonFromFile(basePath: string, fileName: string): AcademyLesson | null {
  const content = readFileContent(basePath, fileName);
  if (!content) return null;
  const slug = fileName.replace(/\.md$/i, "");
  return { slug, title: extractTitle(content), content };
}

export class AcademyService {
  listModules(): AcademyModule[] {
    try {
      if (!existsSync(ACADEMY_PATH)) return [];
      return readdirSync(ACADEMY_PATH)
        .filter((d) => !d.startsWith("."))
        .map((slug) => this.readModule(slug))
        .filter(Boolean) as AcademyModule[];
    } catch {
      return [];
    }
  }

  getModule(slug: string): AcademyModule | null {
    const modulePath = join(ACADEMY_PATH, slug);
    if (!existsSync(modulePath)) return null;
    return this.readModule(slug);
  }

  getLesson(moduleSlug: string, lessonSlug: string): AcademyLesson | null {
    const modulePath = join(ACADEMY_PATH, moduleSlug);
    if (!existsSync(modulePath)) return null;
    const file = `${lessonSlug}.md`;
    return lessonFromFile(modulePath, file);
  }

  private readModule(slug: string): AcademyModule | null {
    const modulePath = join(ACADEMY_PATH, slug);
    if (!existsSync(modulePath)) return null;

    const readme = readFileContent(modulePath, "README.md");
    if (!readme) return null;

    const title = extractTitle(readme);
    const description = extractDescription(readme);
    const status = extractField(readme, "Estado");
    const progress = extractField(readme, "Progreso");

    const lessons: AcademyLesson[] = [];
    try {
      const files = readdirSync(modulePath)
        .filter((f) => f.endsWith(".md") && f !== "README.md")
        .sort();
      for (const file of files) {
        const lesson = lessonFromFile(modulePath, file);
        if (lesson) lessons.push(lesson);
      }
    } catch {
      // empty
    }

    return { slug, title, description, status, progress, lessons };
  }
}
