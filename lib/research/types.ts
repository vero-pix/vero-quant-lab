export interface ResearchProject {
  id: string;
  title: string;
  status: string;
  objective: string | null;
  hypothesis: string | null;
  evidence: string | null;
  conclusion: string | null;
  decision: string | null;
  actions: string | null;
  lastModified: string;
  progress: string;
}
