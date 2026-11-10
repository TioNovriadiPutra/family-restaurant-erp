import Head from "next/head";
import type { ErpPage } from "@/interfaces/layout";
import { requireErpPage } from "@/lib/server/erp-page";
import { PageState } from "@/components/shared/page-state";
import { EmployeesPage } from "@/components/custom/employees/employees-page";

export const getServerSideProps = requireErpPage(["staff.read", "rbac.read"]);
const Employees: ErpPage = ({ session, forbidden, unavailable }) => {
  if (!session || unavailable || forbidden) return <PageState forbidden={forbidden} />;
  return <><Head><title>Karyawan · Dapur Keluarga</title><meta name="description" content="Daftar profil, role dan status karyawan per outlet." /><meta name="robots" content="noindex, nofollow" /></Head><EmployeesPage session={session} /></>;
};
Employees.erpLayout = true;
export default Employees;
