import { SectionTitle } from '@/components/shared/page-heading';
import Link from "next/link";
import { ArrowRight2 } from "iconsax-reactjs";
import type { ModuleCardProps } from "@/interfaces/module-menu";

export function ModuleMenuCard({ moduleSlug, section }: ModuleCardProps) {
  const Icon = section.icon;
  const titleId = `${moduleSlug}-${section.slug}-title`;
  const descriptionId = `${moduleSlug}-${section.slug}-description`;
  return (
    <Link href={`/${moduleSlug}/${section.slug}`} className="module-menu-card card" aria-labelledby={titleId} aria-describedby={descriptionId}>
      <div className="flex items-center gap-4">
        <span className="module-menu-card-icon"><Icon aria-hidden="true" size={24} variant="Linear" /></span>
        <SectionTitle id={titleId} className="">{section.title}</SectionTitle>
      </div>
      <p id={descriptionId} className="mt-4 text-pretty type-16-regular text-muted-foreground">{section.description}</p>
      <span className="mt-auto flex items-center justify-between gap-4 pt-6 type-13-semibold text-primary">
        Buka menu <ArrowRight2 aria-hidden="true" size={18} variant="Linear" className="module-menu-card-arrow" />
      </span>
    </Link>
  );
}
