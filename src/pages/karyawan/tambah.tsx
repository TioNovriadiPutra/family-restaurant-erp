import Head from "next/head";
import type { ErpPage } from "@/interfaces/layout";
import { requireErpPage } from "@/lib/server/erp-page";
import { PageState } from "@/components/shared/page-state";
import { EmployeeCreatePage } from "@/components/custom/employees/employees-page";

export const getServerSideProps = requireErpPage([
  "staff.read",
  "rbac.read",
  "staff.manage",
  "rbac.manage",
]);
const EmployeeCreate: ErpPage = ({ session, forbidden, unavailable }) => {
  if (!session || unavailable || forbidden)
    return <PageState forbidden={forbidden} />;
  return (
    <>
      <Head>
        <title>Tambah karyawan · Dapur Keluarga</title>
        <meta
          name="description"
          content="Tambahkan profil karyawan dan penugasan role pada outlet."
        />
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <EmployeeCreatePage session={session} />
    </>
  );
};
EmployeeCreate.erpLayout = true;
export default EmployeeCreate;
