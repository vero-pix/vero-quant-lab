import { getTradingService } from "@/lib/trading";
import { WorkspaceHome } from "@/components/workspace-home";

export default function HomePage() {
  const service = getTradingService();
  return (
    <WorkspaceHome
      dashboard={service.getDashboard()}
      systemStatus={service.getSystemStatus()}
    />
  );
}
