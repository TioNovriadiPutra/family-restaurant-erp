import { PageTitle } from '@/components/shared/page-heading';
import Link from "next/link";
import { ArrowLeft2 } from "iconsax-reactjs";
import type { ModuleSectionProps } from "@/interfaces/module-menu";
import { PageState } from "@/components/shared/page-state";
import { useModuleMenu } from "@/hooks/modules/use-module-menu";

export function ModuleSection({ moduleSlug, title, session, sectionSlug }: ModuleSectionProps) {
  const { sections } = useModuleMenu(moduleSlug, session);
  const section = sections.find(item => item.slug === sectionSlug);
  if (!section) return <PageState forbidden />;
  const Icon = section.icon;
  return (
    <div className="max-w-3xl space-y-6">
      <Link href={`/${moduleSlug}`} className="ui-button ui-button-ghost !px-0 text-primary">
        <ArrowLeft2 size={18} aria-hidden="true" />Kembali ke {title}
      </Link>
      <div className="ui-card">
        <div className="flex items-center gap-4">
          <span className="module-menu-card-icon"><Icon size={24} variant="Linear" aria-hidden="true" /></span>
          <PageTitle className="">{section.title}</PageTitle>
        </div>
        <p className="mt-4 type-16-regular text-muted-foreground">{section.description}</p>
        <p className="ui-alert ui-alert-info mt-6" role="status">
          Halaman operasional {section.title.toLowerCase()} belum diimplementasikan. Pilihan menu ini sudah tersedia untuk navigasi; pencatatan dan pengolahan datanya akan ditambahkan pada pengembangan modul.
        </p>
      </div>
    </div>
  );
}
