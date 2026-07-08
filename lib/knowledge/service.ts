import { readFileSync, readdirSync, existsSync, statSync } from "fs";
import { join, resolve } from "path";
import type { KnowledgeDoc } from "./types";

const KNOWLEDGE_PATH = resolve(process.cwd(), "KNOWLEDGE");

function slugFromFile(name: string): string {
  return name.replace(/\.md$/i, "");
}

function titleFromContent(content: string): string {
  const match = content.match(/^#\s+(.+)/m);
  return match?.[1]?.trim() ?? slugFromFile("");
}

function parseFrontmatter(raw: string): { frontmatter: Record<string, string>; body: string } {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: raw };
  const frontmatter: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const sep = line.indexOf(":");
    if (sep !== -1) frontmatter[line.slice(0, sep).trim()] = line.slice(sep + 1).trim();
  }
  return { frontmatter, body: match[2] };
}

function readDoc(f: string): KnowledgeDoc {
  const raw = readFileSync(join(KNOWLEDGE_PATH, f), "utf-8");
  const { frontmatter, body } = parseFrontmatter(raw);
  const slug = slugFromFile(f);
  const stats = statSync(join(KNOWLEDGE_PATH, f));
  return {
    slug,
    title: titleFromContent(body),
    category: frontmatter.category ?? "General",
    content: body,
    lastModified: stats.mtime.toISOString().split("T")[0],
  };
}

export class KnowledgeService {
  list(): KnowledgeDoc[] {
    try {
      if (!existsSync(KNOWLEDGE_PATH)) return [];
      return readdirSync(KNOWLEDGE_PATH)
        .filter((f) => f.endsWith(".md"))
        .map((f) => readDoc(f))
        .sort((a, b) => a.title.localeCompare(b.title));
    } catch {
      return [];
    }
  }

  getBySlug(slug: string): KnowledgeDoc | null {
    try {
      if (!existsSync(KNOWLEDGE_PATH)) return null;
      const files = readdirSync(KNOWLEDGE_PATH).filter((f) => f.endsWith(".md"));
      const match = files.find((f) => slugFromFile(f) === slug);
      if (!match) return null;
      return readDoc(match);
    } catch {
      return null;
    }
  }
}
