import { MockVpsAdapter, HttpVpsAdapter } from "./adapter";
import { MonitoringService } from "./service";

let instance: MonitoringService | null = null;

export function getMonitoringService(): MonitoringService {
  if (!instance) {
    const vpsUrl = process.env.VPS_API_URL;
    const adapter = vpsUrl ? new HttpVpsAdapter(vpsUrl) : new MockVpsAdapter();
    instance = new MonitoringService(adapter);
  }
  return instance;
}

export type { HealthStatus, ComponentHealth, SystemHealthData, ServiceRunStatus, ServiceInfo } from "./types";
export type { VpsAdapter, VpsSnapshot } from "./adapter";
export { MonitoringService } from "./service";
export { MockVpsAdapter, HttpVpsAdapter } from "./adapter";
