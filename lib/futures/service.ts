import type { FuturesAdapter } from "./adapter";
import type { FuturesPosition, FuturesSnapshot } from "./types";

export class FuturesService {
  constructor(private adapter: FuturesAdapter) {}

  async getSnapshot(): Promise<FuturesSnapshot> {
    return this.adapter.fetchSnapshot();
  }

  async getPositions(): Promise<FuturesPosition[]> {
    const snapshot = await this.adapter.fetchSnapshot();
    return snapshot.positions;
  }
}
