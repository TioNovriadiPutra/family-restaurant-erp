import type {
  PageTitleProps,
  SectionTitleProps,
  PageHeaderProps,
} from "@/interfaces/ui";
export function PageTitle({ className = "", ...props }: PageTitleProps) {
  return <h1 {...props} className={`ui-page-title ${className}`} />;
}
export function SectionTitle({ className = "", ...props }: SectionTitleProps) {
  return <h2 {...props} className={`ui-section-title ${className}`} />;
}
export function PageHeader({ className = "", ...props }: PageHeaderProps) {
  return <div {...props} className={`ui-page-header ${className}`} />;
}
