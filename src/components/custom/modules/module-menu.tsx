import type { ModuleHubProps } from "@/interfaces/module-menu";
import { useModuleMenu } from "@/hooks/modules/use-module-menu";
import { ModuleMenuCard } from "@/components/shared/module-menu-card";

export function ModuleMenu({ moduleSlug, title, session }: ModuleHubProps) {
  const { definition, sections, outletName } = useModuleMenu(moduleSlug, session);
  if (!definition) return null;
  return (
    <div className="space-y-8">
      <div className="max-w-3xl">
        <p className="mb-2 type-13-regular text-muted-foreground">Area kerja · {outletName}</p>
        <h1 className="type-28-semibold">{title}</h1>
        <p className="mt-3 max-w-2xl text-pretty type-16-regular text-muted-foreground">{definition.description}</p>
      </div>
      <section aria-label={`Pilihan menu ${title}`} className="grid auto-rows-fr gap-5 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6">
        {sections.map(section => <ModuleMenuCard key={section.slug} moduleSlug={moduleSlug} section={section} />)}
      </section>
      {!sections.length && <p className="ui-alert ui-alert-info" role="status">Belum ada submenu yang dapat diakses pada outlet ini. Hubungi administrator untuk memeriksa permission akun.</p>}
    </div>
  );
}
