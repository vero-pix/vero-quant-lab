export interface ActiveResearch {
  id: string;
  title: string;
  status: string;
  progress: string;
}

export interface LastDecision {
  decision: string;
  date: string;
  status: string;
}

export interface LabStatus {
  activeResearch: ActiveResearch | null;
  lastDecision: LastDecision | null;
  researchCount: number;
}

export interface NextAction {
  label: string;
  description: string;
  type: "research" | "trading" | "review" | "empty";
}

export interface ResearchFile {
  name: string;
  path: string;
}

export interface ResearchListItem {
  id: string;
  title: string;
  status: string;
  objective: string;
  priority: "alta" | "media" | "baja";
  date: string;
  lastModified: string;
  decision: string;
  progress: string;
  files: ResearchFile[];
}
