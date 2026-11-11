import { PageHeader, PageTitle, SectionTitle } from '@/components/shared/page-heading';
import Link from "next/link";
import { Add, ArrowLeft2, ArrowRight2, People, SearchNormal1 } from "iconsax-reactjs";
import type { EmployeesListProps } from "@/interfaces/employees";
import { useEmployeeList } from "@/hooks/employees/use-employee-list";
import { employeeError } from "@/controller/employees/use-employees";
import { SelectInput } from "@/components/shared/select-input";
import { EmployeeManagementDialog } from "./employee-management-dialog";
import { EmployeePinDialog } from "./employee-pin-dialog";
import { EmployeeTable } from "./employee-table";

export function EmployeeList({ outletId, outletName, canCreate }: EmployeesListProps) {
  const list = useEmployeeList(outletId);
  const data = list.query.data;
  const pending = list.query.isFetching || list.searching;
  return <div className="space-y-6">
    <PageHeader className="flex flex-wrap items-start justify-between gap-4">
      <div><PageTitle className="">Karyawan</PageTitle><p className="mt-2 text-muted-foreground">Data karyawan dan role dalam satu daftar · {outletName}</p></div>
      {canCreate && <Link href="/karyawan/tambah" className="ui-button ui-button-primary min-h-11 w-full sm:w-auto"><Add aria-hidden="true" size={20} />Tambah karyawan</Link>}
    </PageHeader>
    <div className="ui-card grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)] ui-filter-bar">
      <div className="ui-field"><label htmlFor="employee-search" className="ui-label">Cari karyawan</label><div className="relative"><SearchNormal1 aria-hidden="true" size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input id="employee-search" className="ui-input min-h-11 !pl-10" type="search" maxLength={120} placeholder="Cari nama, ID atau email…" value={list.search} onChange={event => list.changeSearch(event.target.value)} /></div></div>
      <div className="ui-field"><label htmlFor="employee-role-filter" className="ui-label">Role</label><SelectInput id="employee-role-filter" className="min-h-11" value={list.roleId} onValueChange={list.changeRole} disabled={list.roles.isPending}><option value="">Semua role</option>{list.roles.data?.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}</SelectInput></div>
      <div className="ui-field"><label htmlFor="employee-status-filter" className="ui-label">Status</label><SelectInput id="employee-status-filter" className="min-h-11" value={list.status} onValueChange={list.changeStatus}><option value="all">Semua status</option><option value="active">Aktif</option><option value="inactive">Nonaktif</option></SelectInput></div>
    </div>
    {list.roles.isError && <p className="ui-alert ui-alert-warning" role="alert">{employeeError(list.roles.error).message}</p>}
    {list.pinNotice && <p role="status" className="ui-alert ui-alert-success">{list.pinNotice}</p>}
    {list.pinEmployee && canCreate && <EmployeePinDialog key={list.pinEmployee.id} employee={list.pinEmployee} outletId={outletId} onClose={list.closePin} onSaved={list.pinSaved} />}
    {list.editingEmployee && canCreate && <EmployeeManagementDialog key={`edit-${list.editingEmployee.id}`} action="edit" employee={list.editingEmployee} outletId={outletId} onClose={list.closeEdit} onSaved={list.pinSaved} />}
    {list.deletingEmployee && canCreate && <EmployeeManagementDialog key={`delete-${list.deletingEmployee.id}`} action="delete" employee={list.deletingEmployee} outletId={outletId} onClose={list.closeDelete} onSaved={list.pinSaved} />}
    <section aria-label="Daftar karyawan" aria-busy={pending}>
      <p role="status" className={pending ? "mb-4 type-13-regular text-muted-foreground" : "sr-only"}>{pending ? "Memuat daftar karyawan…" : `${data?.total ?? 0} karyawan ditemukan.`}</p>
      {list.query.isError ? <div className="ui-alert ui-alert-destructive" role="alert"><p>{employeeError(list.query.error).message}</p><button type="button" className="ui-button ui-button-secondary justify-self-start" onClick={() => list.query.refetch()}>Coba lagi</button></div> : data?.items.length ? <EmployeeTable employees={data.items} canManagePin={canCreate} onSetPin={list.openPin} onEdit={list.openEdit} onDelete={list.openDelete} /> : !pending && <div className="ui-card grid justify-items-center gap-4 py-12 text-center"><People size={36} variant="Linear" className="text-primary" aria-hidden="true" /><SectionTitle className="">{data?.summary.total ? "Tidak ada hasil yang sesuai" : "Belum ada karyawan"}</SectionTitle><p className="text-muted-foreground">{data?.summary.total ? "Coba ubah kata pencarian, role, atau status karyawan." : "Tambahkan profil karyawan untuk memulai pendataan outlet ini."}</p>{Boolean(list.search || list.roleId || list.status !== "all") && <button className="ui-button ui-button-secondary" type="button" onClick={list.resetFilters}>Reset filter</button>}</div>}
    </section>
    {data && !list.query.isError && <div className="flex flex-wrap items-center justify-between gap-4">
      <div><p className="type-13-regular text-muted-foreground">{data.total ? (data.page - 1) * data.page_size + 1 : 0}–{Math.min(data.page * data.page_size, data.total)} dari {data.total} hasil</p><p className="mt-1 type-13-regular text-muted-foreground">Outlet: {data.summary.total} karyawan · {data.summary.active} aktif · {data.summary.inactive} nonaktif</p></div>
      <div className="flex items-center gap-3"><button aria-label="Halaman sebelumnya" className="ui-button ui-button-secondary min-h-11 !px-3" type="button" disabled={pending || data.page <= 1} onClick={list.previous}><ArrowLeft2 aria-hidden="true" size={18} /></button><span className="type-13-regular">{data.page} / {data.pages}</span><button aria-label="Halaman berikutnya" className="ui-button ui-button-secondary min-h-11 !px-3" type="button" disabled={pending || data.page >= data.pages} onClick={list.next}><ArrowRight2 aria-hidden="true" size={18} /></button></div>
    </div>}
    <p className="ui-alert ui-alert-info type-13-regular">Profil karyawan dan akun login dikelola terpisah. Menambah profil di sini tidak membuat akun Supabase Auth atau mengirim undangan.</p>
  </div>;
}
