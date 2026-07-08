export type HealthStatus = "online" | "warning" | "offline";

export interface ComponentHealth {
  id: string;
  name: string;
  status: HealthStatus;
  detail: string;
}

export interface SystemHealthData {
  components: ComponentHealth[];
  heartbeat: string;
  updatedAt: string;
}

export type ServiceRunStatus = "running" | "restarting" | "stopped";

export interface ServiceInfo {
  id: string;
  name: string;
  status: ServiceRunStatus;
  uptime: string;
  lastRestart: string;
  description: string;
}
