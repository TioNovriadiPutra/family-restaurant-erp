import type { Icon } from "iconsax-reactjs";
import type { AuthSession } from "./auth";

export interface ModuleSection {
  slug: string;
  title: string;
  description: string;
  icon: Icon;
  permission?: string;
  designNode: number;
}
export interface ModuleDefinition {
  description: string;
  sections: ModuleSection[];
}
export interface ModuleHubProps { moduleSlug: string; title: string; session: AuthSession }
export interface ModuleCardProps { moduleSlug: string; section: ModuleSection }
export interface ModuleSectionProps extends ModuleHubProps { sectionSlug: string }
