import { ResearchService } from "./service";

let instance: ResearchService | null = null;

export function getResearchService(): ResearchService {
  if (!instance) {
    instance = new ResearchService();
  }
  return instance;
}

export type { ResearchProject } from "./types";
export { ResearchService } from "./service";
