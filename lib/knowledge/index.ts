import { KnowledgeService } from "./service";

let instance: KnowledgeService | null = null;

export function getKnowledgeService(): KnowledgeService {
  if (!instance) {
    instance = new KnowledgeService();
  }
  return instance;
}

export type { KnowledgeDoc } from "./types";
export { KnowledgeService } from "./service";
