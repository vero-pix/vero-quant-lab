import { LabService } from "./service";

let instance: LabService | null = null;

export function getLabService(): LabService {
  if (!instance) {
    instance = new LabService();
  }
  return instance;
}

export type { LabStatus, ActiveResearch, LastDecision, NextAction, ResearchListItem, ResearchFile } from "./types";
export { LabService } from "./service";
