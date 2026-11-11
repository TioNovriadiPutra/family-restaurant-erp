import { PageTitle } from '@/components/shared/page-heading';
import Link from "next/link";
import { ArrowLeft2 } from "iconsax-reactjs";
import type { EmployeeFormProps } from "@/interfaces/employees";
import { useEmployeeForm } from "@/hooks/employees/use-employee-form";
import { employeeError } from "@/controller/employees/use-employees";
import { EmployeeFields } from "./employee-fields";

export function EmployeeForm({ outletId, outletName }: EmployeeFormProps) {
  const { form, roles, submit, pending } = useEmployeeForm(outletId);
  const {
    formState: { errors },
  } = form;
  return (
    <div className="max-w-5xl space-y-4">
      <Link
        href="/karyawan"
        className="ui-button ui-button-ghost !px-0 text-primary"
      >
        <ArrowLeft2 aria-hidden="true" size={18} />
        Kembali ke karyawan
      </Link>
      <div>
        <PageTitle className="">Tambah karyawan</PageTitle>
        <p className="mt-2 text-muted-foreground">
          Isi data dasar karyawan, lalu pilih role dan status · {outletName}
        </p>
      </div>
      <form
        method="post"
        onSubmit={submit}
        noValidate
        aria-busy={pending}
        className="space-y-4 ui-form"
      >
        <div className="ui-card space-y-4">
          <EmployeeFields
            form={form}
            roles={roles.data ?? []}
            disabled={pending}
            roleDisabled={pending || roles.isPending || roles.isError}
          />
          <p className="ui-help">
            ID dibuat otomatis saat disimpan. Profil belum memiliki akun login.
            Akses ERP hanya untuk Pemilik dan Manajer.
          </p>
        </div>
        <p className="ui-help">
          Disimpan pada {outletName}. Mengganti outlet akan mengosongkan form.
          Karyawan nonaktif tetap tersimpan dalam riwayat.
        </p>
        {roles.isError && (
          <div className="ui-alert ui-alert-destructive" role="alert">
            <p>{employeeError(roles.error).message}</p>
            <button
              type="button"
              className="ui-button ui-button-secondary justify-self-start"
              onClick={() => roles.refetch()}
            >
              Muat ulang role
            </button>
          </div>
        )}
        {errors.root && (
          <p className="ui-alert ui-alert-destructive" role="alert">
            {errors.root.message}
          </p>
        )}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {pending ? (
            <button className="ui-button ui-button-secondary min-h-11" disabled>
              Batal
            </button>
          ) : (
            <Link
              href="/karyawan"
              className="ui-button ui-button-secondary min-h-11 sm:min-w-32"
            >
              Batal
            </Link>
          )}
          <button
            type="submit"
            className="ui-button ui-button-primary min-h-11 sm:min-w-52"
            disabled={
              pending || roles.isPending || roles.isError || !roles.data?.length
            }
          >
            {pending ? "Menyimpan profil…" : "Simpan karyawan"}
          </button>
        </div>
        <p role="status" className="sr-only">
          {pending ? "Menyimpan profil karyawan…" : ""}
        </p>
      </form>
    </div>
  );
}
