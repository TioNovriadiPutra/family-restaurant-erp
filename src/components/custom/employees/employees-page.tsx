import type { EmployeesPageProps } from "@/interfaces/employees";
import { useEmployeeContext } from "@/hooks/employees/use-employee-context";
import { PageState } from "@/components/shared/page-state";
import { EmployeeList } from "./employee-list";
import { EmployeeForm } from "./employee-form";

export function EmployeesPage({ session }: EmployeesPageProps) {
  const context = useEmployeeContext(session);
  if (!context.canRead || !context.selected) return <PageState forbidden />;
  return (
    <EmployeeList
      key={context.selected.outlet_id}
      outletId={context.selected.outlet_id}
      outletName={context.selected.outlet_name}
      canCreate={context.canCreate}
    />
  );
}
export function EmployeeCreatePage({ session }: EmployeesPageProps) {
  const context = useEmployeeContext(session);
  if (!context.canCreate || !context.selected) return <PageState forbidden />;
  return (
    <EmployeeForm
      key={context.selected.outlet_id}
      outletId={context.selected.outlet_id}
      outletName={context.selected.outlet_name}
    />
  );
}
