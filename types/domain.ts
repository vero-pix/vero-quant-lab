export type EntityId = string;
export type ISODateString = string;

export type LifecycleStatus =
  | "draft"
  | "active"
  | "paused"
  | "completed"
  | "archived";

export type ResearchProjectStatus = "draft" | "active" | "paused" | "completed" | "archived";
export type ExperimentStatus = "planned" | "running" | "completed" | "invalidated" | "archived";
export type HypothesisStatus = "draft" | "active" | "validated" | "rejected" | "archived";
export type PaperStatus = "queued" | "reading" | "studied" | "referenced" | "archived";
export type StrategyStatus = "draft" | "researching" | "testing" | "approved" | "retired";
export type BenchmarkStatus = "planned" | "running" | "completed" | "failed" | "archived";
export type IndicatorStatus = "draft" | "testing" | "approved" | "deprecated";
export type TradeStatus = "planned" | "open" | "closed" | "cancelled";
export type KnowledgeArticleStatus = "draft" | "published" | "reviewing" | "archived";
export type AcademyLessonStatus = "draft" | "reviewing" | "published" | "archived";

export type Timeframe =
  | "tick"
  | "1m"
  | "5m"
  | "15m"
  | "1h"
  | "4h"
  | "1d"
  | "1w";

export type MarketType = "crypto" | "equity" | "forex" | "futures" | "other";
export type TradeSide = "long" | "short";

export type DomainReference = {
  id: EntityId;
  title: string;
};

export type BaseEntity = {
  id: EntityId;
  title: string;
  summary?: string;
  tags: string[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
};

export interface ResearchProject extends BaseEntity {
  status: ResearchProjectStatus;
  objective: string;
  researchQuestion?: string;
  hypothesisIds: EntityId[];
  experimentIds: EntityId[];
  paperIds: EntityId[];
  strategyIds: EntityId[];
  knowledgeArticleIds: EntityId[];
}

export interface Experiment extends BaseEntity {
  status: ExperimentStatus;
  researchProjectId: EntityId;
  hypothesisIds: EntityId[];
  strategyId?: EntityId;
  benchmarkIds: EntityId[];
  methodology: string;
  parameters: Record<string, string | number | boolean>;
  conclusion?: string;
}

export interface Hypothesis extends BaseEntity {
  status: HypothesisStatus;
  researchProjectId: EntityId;
  experimentIds: EntityId[];
  paperIds: EntityId[];
  statement: string;
  rationale?: string;
  validationCriteria?: string;
  outcome?: string;
}

export interface Paper extends BaseEntity {
  status: PaperStatus;
  authors: string[];
  source?: string;
  publishedAt?: ISODateString;
  url?: string;
  researchProjectIds: EntityId[];
  hypothesisIds: EntityId[];
  knowledgeArticleIds: EntityId[];
  notes?: string;
}

export interface Strategy extends BaseEntity {
  status: StrategyStatus;
  researchProjectId?: EntityId;
  experimentIds: EntityId[];
  benchmarkIds: EntityId[];
  indicatorIds: EntityId[];
  marketTypes: MarketType[];
  timeframes: Timeframe[];
  thesis: string;
  riskModel?: string;
}

export interface Benchmark extends BaseEntity {
  status: BenchmarkStatus;
  strategyId?: EntityId;
  experimentId?: EntityId;
  timeframe: Timeframe;
  marketType: MarketType;
  baseline?: string;
  resultSummary?: string;
  executedAt?: ISODateString;
}

export interface Indicator extends BaseEntity {
  status: IndicatorStatus;
  strategyIds: EntityId[];
  formula?: string;
  parameters: Record<string, string | number | boolean>;
  timeframes: Timeframe[];
}

export interface Trade extends BaseEntity {
  status: TradeStatus;
  strategyId?: EntityId;
  symbol: string;
  marketType: MarketType;
  side: TradeSide;
  entryPrice?: number;
  exitPrice?: number;
  openedAt?: ISODateString;
  closedAt?: ISODateString;
  notes?: string;
}

export interface KnowledgeArticle extends BaseEntity {
  status: KnowledgeArticleStatus;
  slug: string;
  category: string;
  relatedResearchProjectIds: EntityId[];
  relatedPaperIds: EntityId[];
  relatedStrategyIds: EntityId[];
  contentSummary?: string;
}

export interface AcademyLesson extends BaseEntity {
  status: AcademyLessonStatus;
  module: string;
  order: number;
  learningObjectives: string[];
  relatedKnowledgeArticleIds: EntityId[];
  relatedResearchProjectIds: EntityId[];
}
