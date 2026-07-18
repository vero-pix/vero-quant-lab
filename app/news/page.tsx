import { PageHeader } from "@/components/layout/page-header";
import { NewsPanel } from "@/components/news/news-panel";

export default function NewsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Noticias"
        title="Noticias cripto"
        description="Titulares de fuentes públicas en vivo. Informativo y de solo lectura — el sistema no opera con esto."
      />
      <NewsPanel />
    </div>
  );
}
