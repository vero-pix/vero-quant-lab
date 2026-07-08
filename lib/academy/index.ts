import { AcademyService } from "./service";

let instance: AcademyService | null = null;

export function getAcademyService(): AcademyService {
  if (!instance) {
    instance = new AcademyService();
  }
  return instance;
}

export type { AcademyModule, AcademyLesson } from "./types";
export { AcademyService } from "./service";
