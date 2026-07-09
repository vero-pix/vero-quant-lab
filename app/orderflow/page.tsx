import { PageHeader } from "@/components/layout/page-header";

export const metadata = {
  title: "Order Flow · VQL",
};

export default function OrderFlowPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Order Flow"
        title="Heatmap de liquidez"
        description="Mapa de calor tipo Bookmap con libro y trades en vivo de Binance (ETH · BTC · SOL). Corre 100% en el navegador. Solo lectura."
      />
      <div className="overflow-hidden rounded-xl border border-border bg-black shadow-lg">
        <iframe
          src="/orderflow.html"
          title="Order Flow — heatmap Bookmap con feed Binance"
          className="h-[calc(100vh-12rem)] min-h-[560px] w-full border-0"
          loading="lazy"
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Basado en{" "}
        <a
          href="https://github.com/Azhagesan-dev/OrderFlowMap"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          OrderFlowMap
        </a>{" "}
        (licencia MIT) · feed en vivo adaptado a Binance.
      </p>
    </div>
  );
}
