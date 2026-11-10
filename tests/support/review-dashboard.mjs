// Local review harness: real Next.js app, fake Supabase services, loopback only.
// Never imported by application code. No production credentials are read.
import http from "node:http";
import next from "next";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createInventoryReview } from "./review-inventory-data.mjs";
import { inventoryBrowserChecks } from "./review-inventory-browser.mjs";
import { createRecipesReview } from "./review-recipes-data.mjs";
import { createFinanceReview } from "./review-finance-data.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const reviewRoot = path.resolve(root,"../design-artifacts/erp-home-review/app");
await fs.mkdir(reviewRoot,{recursive:true});
for (const directory of ["src","public"]) await fs.cp(path.join(root,directory),path.join(reviewRoot,directory),{recursive:true});
for (const filename of ["package.json","package-lock.json","tsconfig.json","next-env.d.ts"]) await fs.copyFile(path.join(root,filename),path.join(reviewRoot,filename));
try { await fs.access(path.join(reviewRoot,"node_modules")); }
catch { await fs.symlink(path.join(root,"node_modules"),path.join(reviewRoot,"node_modules"),process.platform==="win32"?"junction":"dir"); }
await fs.writeFile(path.join(reviewRoot,"next.config.mjs"),`export default {reactStrictMode:true,experimental:{agentFeedback:false},turbopack:{root:${JSON.stringify(path.dirname(root))},rules:{"*.css":{loaders:["@tailwindcss/turbopack"],as:"*.css"}}}};`);
const id = "65ef7c2e-d91a-4efb-a0bb-019c422062a1";
const secondId = "65ef7c2e-d91a-4efb-a0bb-019c422062a2";
const inventoryReview=createInventoryReview(id,id,secondId);
const recipesReview=createRecipesReview(id);
const financeReview=createFinanceReview(id);
const user = { id, email: "pemilik@example.invalid", aud: "authenticated", role: "authenticated", app_metadata: {}, user_metadata: {}, created_at: "2026-11-08T00:00:00Z" };
const permissions = ["reports.read", "sales.read", "inventory.read", "inventory.manage", "audit.read", "recipes.read", "refunds.read", "finance.read", "approvals.review", "purchasing.read", "staff.read", "organization.manage", "menu.read", "rbac.read", "shifts.read"];
const access = [id,secondId].map((outlet_id,index) => ({ employee_id: id, restaurant_id: id, outlet_id, outlet_name: index ? "Outlet cadangan" : "Outlet utama", role: "Pemilik", permissions }));
permissions.push("staff.manage", "rbac.manage", "purchasing.manage", "finance.manage", "recipes.manage");
const employeeRoles = ["Pemilik", "Manajer", "Kasir", "Staf Gudang"].map((name,index)=>({id:`65ef7c2e-d91a-4efb-a0bb-019c422063a${index}`,name}));
const employees = ["Andi Pratama", "Siti Rahma", "Budi Santoso"].map((name,index)=>({id:`65ef7c2e-d91a-4efb-a0bb-019c422064a${index}`,employee_code:`KRY-00${index+1}`,name,email:`karyawan${index+1}@example.invalid`,phone:null,active:index!==2,login_linked:false,created_at:"2026-11-08T00:00:00Z",roles:[employeeRoles[[2,1,3][index]]]}));
const configuredPins=new Set();
function employeeDirectory(input){
  if(input.p_options_only)return {roles:employeeRoles};
  const items=employees.filter(row=>(!input.p_search||`${row.employee_code} ${row.name} ${row.email}`.toLowerCase().includes(input.p_search.toLowerCase()))&&(!input.p_role_id||row.roles.some(role=>role.id===input.p_role_id))&&(input.p_active==null||row.active===input.p_active));
  return {items,total:items.length,page:1,page_size:10,roles:employeeRoles,summary:{total:employees.length,active:employees.filter(row=>row.active).length,inactive:employees.filter(row=>!row.active).length}};
}
const encode = value => Buffer.from(JSON.stringify(value)).toString("base64url");
const token = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: id, exp: Math.floor(Date.now()/1000)+3600 })}.review-signature`;

function dashboard(outletId) {
  const alternate = outletId === secondId;
  return {
    day: "2026-11-08", timezone: "Asia/Jakarta", generated_at: "2026-11-08T03:32:00Z",
    revenue: alternate ? "720000" : "3840000", paid_orders: alternate ? 12 : 64, open_orders: 4,
    average_order: "60000", cost: alternate ? "240000" : "1228800", gross_profit: alternate ? "480000" : "2611200",
    low_stock: 3, pending_counts: 1, pending_edc: 2, has_refunds: false,
    sales: [2200000,2500000,1900000,2800000,3200000,3600000,alternate ? 720000 : 3040000].map((value,index) => ({ day: `2026-11-0${index+2}`, revenue: String(value) })),
    top_menu: [{ name: "Nasi goreng ayam", quantity: "28", revenue: "784000" }, { name: "Ayam bakar kecap", quantity: "22", revenue: "704000" }],
    activities: [{ id: "1", action: "verified", entity_type: "orders", number: "#024", occurred_at: "2026-11-08T03:32:00Z" }, { id: "2", action: "posted", entity_type: "goods_receipts", number: "GR-018", occurred_at: "2026-11-08T03:15:00Z" }, { id: "3", action: "updated", entity_type: "stock_items", number: null, occurred_at: "2026-11-08T02:40:00Z" }],
  };
}

const fake = http.createServer(async (req,res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "authorization,apikey,content-type,x-client-info,x-supabase-api-version");
  if (req.method === "OPTIONS") { res.end(); return; }
  let raw=""; for await (const chunk of req) raw+=chunk;
  if (req.url.startsWith("/auth/v1/token")) res.end(JSON.stringify({ access_token: token, refresh_token: "review-refresh", token_type: "bearer", expires_in: 3600, user }));
  else if (req.url === "/auth/v1/user") res.end(JSON.stringify(user));
  else if (req.url.startsWith("/auth/v1/logout")) { res.statusCode=204; res.end(); }
  else if (req.url === "/rest/v1/rpc/my_access") res.end(JSON.stringify(access));
  else if (req.url === "/rest/v1/rpc/employee_pin_statuses") {const input=JSON.parse(raw);res.end(JSON.stringify(Object.fromEntries(input.p_employee_ids.map(id=>[id,{pin_configured:configuredPins.has(id),pin_eligible:employees.some(row=>row.id===id&&row.active&&row.roles.some(role=>role.name==="Kasir"))}]))));}
  else if (req.url === "/rest/v1/rpc/manage_employee_profile") {const input=JSON.parse(raw);const index=employees.findIndex(row=>row.id===input.p_employee_id);if(input.p_action==="delete")employees.splice(index,1);else{Object.assign(employees[index],{name:input.p_name,email:input.p_email,phone:input.p_phone,active:input.p_active});if(input.p_change_role)employees[index].roles=[employeeRoles.find(role=>role.id===input.p_role_id)];}res.end("null");}
  else if (req.url === "/rest/v1/rpc/set_employee_pos_pin") {const input=JSON.parse(raw);configuredPins.add(input.p_employee_id);res.end("null");}
  else if (req.url === "/rest/v1/rpc/employee_directory") res.end(JSON.stringify(employeeDirectory(JSON.parse(raw))));
  else if (req.url === "/rest/v1/rpc/inventory_read" || req.url === "/rest/v1/rpc/inventory_write") {
    const input=JSON.parse(raw);res.end(JSON.stringify(inventoryReview(req.url.endsWith("inventory_write"),input.p_action??input.p_view,{...input.p_data,requestId:input.p_request_id})));
  }
  else if (req.url === "/rest/v1/rpc/recipes_read" || req.url === "/rest/v1/rpc/recipes_write") {
    const input=JSON.parse(raw);res.end(JSON.stringify(recipesReview(req.url.endsWith("recipes_write"),input.p_action??input.p_view,input.p_data)));
  }
  else if (req.url === "/rest/v1/rpc/finance_read" || req.url === "/rest/v1/rpc/finance_write") {
    const input=JSON.parse(raw);res.end(JSON.stringify(financeReview(req.url.endsWith("finance_write"),input.p_action??input.p_view,input.p_data,input.p_request_id)));
  }
  else if(req.url.startsWith("/storage/v1/object/sign/")){res.end(JSON.stringify({signedURL:"/object/sign/review-proof?token=fixture"}));}
  else if(req.url.startsWith("/storage/v1/object/")){res.end(JSON.stringify({Key:req.url,Id:id}));}
  else if (req.url === "/rest/v1/rpc/simple_purchasing") {
    const {p_action}=JSON.parse(raw);
    const supplier={id,code:"SUP-001",name:"Tani Sejahtera",phone:"",email:"supplier@example.invalid",contact:"Budi",payment_terms_days:7,active:true};
    const purchase={id,number:"PB-20261109-001",supplier_name:supplier.name,invoice_number:"INV-0091",invoice_date:"2026-11-09",due_date:"2026-11-16",total:"375000",payment_status:"unpaid",created_at:"2026-11-09T08:00:00Z",lines:[{name:"Beras premium",unit:"kg",quantity:"25",unit_price:"15000",total:"375000"}]};
    const result=p_action==="options"?{suppliers:[supplier],items:[{id,name:"Beras premium",base_unit_id:id,units:[{id,code:"kg"}]}],units:[{id,code:"kg"}],locations:[],accounts:[]}:p_action==="suppliers"?{items:[supplier]}:p_action==="stock"?{items:[{id,name:"Beras premium",code:"BHN-001",location:"Gudang utama",unit:"kg",quantity:"25",inventory_value:"375000",average_unit_cost:"15000"}]}:p_action==="purchases"?{items:[purchase],total:1}:p_action==="detail"?{items:[purchase]}:{id};
    res.end(JSON.stringify(result));
  }
  else if (req.url === "/rest/v1/rpc/erp_dashboard") res.end(JSON.stringify(dashboard(JSON.parse(raw).p_outlet_id)));
  else { res.statusCode=404; res.end("{}"); }
});
await new Promise(resolve => fake.listen(3191,"127.0.0.1",resolve));
process.env.NEXT_PUBLIC_SUPABASE_URL = "http://127.0.0.1:3191";
process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "local-review-public-key";
const app = next({ dev: true, dir: reviewRoot, hostname: "127.0.0.1", port: 3157, turbopack: true });
await app.prepare();
const frontend = http.createServer(app.getRequestHandler());
await new Promise(resolve => frontend.listen(3157,"127.0.0.1",resolve));
let ready = false;
for (let n=0;n<60;n++) {
  try { if ((await fetch("http://127.0.0.1:3157/login")).ok) { ready=true; break; } } catch { /* Starting. */ }
  await new Promise(resolve => setTimeout(resolve,500));
}
if (!ready) { await app.close(); fake.close(); throw new Error("Review Next.js did not start"); }
const login = await fetch("http://127.0.0.1:3157/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json", Origin: "http://127.0.0.1:3157" }, body: JSON.stringify({ email: user.email, password: "local-review-password" }) });
if (!login.ok) throw new Error(`Review login failed: ${login.status}`);
const cookies = login.headers.getSetCookie();
const cookie = cookies.map(value => value.split(";")[0]).join("; ");

// Runs inside the review page under the skill's headless screenshot browser.
// Asserts real client routing preserves the same sidebar/header DOM instances.
const browserChecks = `
(async function(){
  if(${process.env.REVIEW_STATIC === '1'}||new URLSearchParams(location.search).get('review-static')==='1')return;
  const checks=[];
  const wait=async(test)=>{for(let n=0;n<150;n++){if(test())return;await new Promise(r=>setTimeout(r,100));}throw new Error('Review condition timed out');};
  const assert=(v,label)=>{if(!v)throw new Error(label);checks.push(label);};
  try {
    ${inventoryBrowserChecks}
    if(new URLSearchParams(location.search).has('review-phone')){
      const supplier=location.pathname.includes('/pembelian/');
      if(supplier){await wait(()=>document.querySelector('main table tbody tr'));[...document.querySelectorAll('main button')].find(b=>b.textContent.includes('Tambah supplier')).click();}
      const id=supplier?'supplier-phone':'employee-phone';
      await wait(()=>document.getElementById(id));
      const input=document.getElementById(id);
      await wait(()=>Object.keys(input).some(k=>k.startsWith('__reactFiber$')));
      const fill=value=>{Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));};
      fill('+62 812-3456-7890');await wait(()=>input.value==='6281234567890');
      assert(input.inputMode==='numeric','numeric mobile keyboard');assert(input.value==='6281234567890','paste strips non-digits without truncating number');
      fill('0812abc34567890');await wait(()=>input.value==='081234567890');checks.push('typing strips letters');
      assert(!input.required,'phone remains optional');
      fill('02123456789');input.form.requestSubmit();
      await wait(()=>input.getAttribute('aria-invalid')==='true');
      assert(document.getElementById(id+'-error').textContent.includes('Indonesia'),'RHF rejects non-mobile Indonesian format');
      const name=document.getElementById(supplier?'supplier-name':'employee-name');
      assert(name.required && document.querySelector('label[for="'+name.id+'"] .text-destructive'),'required field has semantic required and red asterisk');
      assert(name.getAttribute('aria-invalid')==='true','RHF required validation shows error');
      fill('081234567890');await wait(()=>input.getAttribute('aria-invalid')==='false');checks.push('valid mobile clears error');
      assert(document.documentElement.scrollWidth<=innerWidth,'no horizontal overflow');
      await fetch('/review-result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path:location.pathname,width:innerWidth,ok:true,checks})});return;
    }
    if(new URLSearchParams(location.search).has('review-dropdown')){
      let trigger;
      const key=async(element,key)=>{element.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true,cancelable:true}));await new Promise(r=>setTimeout(r,50));};
      if(location.pathname.startsWith('/pembelian')){
        await wait(()=>document.querySelector('main table tbody tr'));
        [...document.querySelectorAll('main button')].find(b=>b.textContent.includes('Catat pembelian')).click();
        await wait(()=>document.querySelector('[role=combobox][name=supplierId]'));
        trigger=document.querySelector('[role=combobox][name=supplierId]');
      }else{
        await wait(()=>document.querySelector('button[aria-label="Aksi Andi Pratama"]'));
        document.querySelector('button[aria-label="Aksi Andi Pratama"]').click();
        await wait(()=>document.querySelector('[role=menu]'));
        [...document.querySelectorAll('[role=menuitem]')].find(b=>b.textContent==='Edit').click();
        await wait(()=>document.querySelector('dialog[open] #employee-role'));
        trigger=document.querySelector('#employee-role');
        assert(trigger.textContent.includes('Kasir'),'React Hook Form prefilled role label');
      }
      await wait(()=>Object.keys(trigger).some(k=>k.startsWith('__reactFiber$')));
      assert(!document.querySelector('select'),'no native selects rendered');
      trigger.focus();await new Promise(r=>setTimeout(r,150));trigger.click();await wait(()=>document.querySelector('[role=listbox]'));
      assert(trigger.getAttribute('aria-expanded')==='true','combobox exposes expanded state');
      let panel=document.querySelector('[role=listbox]');let rect=panel.getBoundingClientRect();
      assert(rect.left>=0 && rect.right<=innerWidth && rect.top>=0 && rect.bottom<=innerHeight,'popup fits viewport');
      if(location.pathname.startsWith('/karyawan')){
        assert(panel.closest('dialog[open]'),'popup stays in native dialog top layer');
        await key(trigger,'Escape');await wait(()=>!document.querySelector('[role=listbox]'));
        assert(document.querySelector('dialog[open]'),'Escape only closes dropdown');
        assert(document.activeElement===trigger,'Escape returns focus to trigger');
        trigger.click();await wait(()=>document.querySelector('[role=listbox]'));
      }else{
        await key(trigger,'End');await key(trigger,'Enter');await wait(()=>!document.querySelector('[role=listbox]'));
        assert(trigger.textContent.includes('Tani Sejahtera'),'keyboard selection updates form label');
        const expectedDue=new Date(document.querySelector('input[name=invoiceDate]').value+'T00:00:00Z');expectedDue.setUTCDate(expectedDue.getUTCDate()+7);assert(document.querySelector('input[name=dueDate]').value===expectedDue.toISOString().slice(0,10),'supplier selection updates registered due date');
        const item=document.querySelector('[role=combobox][name="lines.0.stockItemId"]');item.click();await wait(()=>document.querySelector('[role=listbox]'));
        [...document.querySelectorAll('[role=option]')].find(o=>o.textContent.includes('Beras')).click();
        await wait(()=>document.querySelector('[role=combobox][name="lines.0.unitId"]').textContent.includes('kg'));
        checks.push('dependent unit follows selected material');
        const status=document.querySelector('[role=combobox][name=paymentStatus]');status.focus();await new Promise(r=>setTimeout(r,150));await key(status,'ArrowDown');await wait(()=>document.querySelector('[role=listbox]'));await key(status,'End');await key(status,'Enter');
        await wait(()=>document.querySelector('[role=combobox][name=accountId]'));checks.push('controlled payment value reveals account field');
        trigger.focus();await new Promise(r=>setTimeout(r,150));trigger.click();await wait(()=>document.querySelector('[role=listbox]'));
        await key(trigger,'Escape');await wait(()=>!document.querySelector('[role=listbox]'));assert(document.activeElement===trigger,'Escape restores focus');
        trigger.click();await wait(()=>document.querySelector('[role=listbox]'));
      }
      document.querySelector('main h1').dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));
      await wait(()=>!document.querySelector('[role=listbox]'));checks.push('outside pointer closes popup');
      trigger.scrollIntoView({block:'center'});await new Promise(r=>setTimeout(r,100));trigger.focus();await new Promise(r=>setTimeout(r,150));trigger.click();await wait(()=>document.querySelector('[role=listbox]'));
      assert(document.documentElement.scrollWidth<=innerWidth,'no horizontal overflow');
      await fetch('/review-result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path:location.pathname,width:innerWidth,ok:true,checks})});return;
    }
    if(location.pathname.startsWith('/pembelian/') || location.pathname==='/persediaan/stok-bahan'){
      await wait(()=>document.querySelector('main table tbody tr'));
      checks.push('server-backed list rendered');
      if(new URLSearchParams(location.search).get('review-form')==='1'){
        const create=[...document.querySelectorAll('main button')].find(b=>/Catat pembelian|Tambah supplier/.test(b.textContent));
        assert(create,'create action available');create.click();
        await wait(()=>document.querySelector('main form'));
        if(location.pathname.includes('pembelian-bahan')){
          await wait(()=>document.querySelector('[role="combobox"][name="lines.0.stockItemId"]'));
          assert(document.querySelector('input[type=file]').accept.includes('application/pdf'),'invoice evidence field');
          assert(document.querySelector('[role=combobox][name=paymentStatus]').textContent.includes('Belum dibayar'),'unpaid default');
          const add=[...document.querySelectorAll('main button')].find(b=>b.textContent==='Tambah baris');add.click();
          await wait(()=>document.querySelector('input[name="lines.1.quantity"]'));checks.push('multiple purchase lines');
          document.querySelector('[aria-label="Hapus bahan 2"]').click();
        }
        checks.push('compact purchase/supplier form rendered');
      }
      assert(document.documentElement.scrollWidth<=innerWidth+1,'no horizontal page overflow');
      checks.push('responsive page without overflow');
      await fetch('/review-result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path:location.pathname,width:innerWidth,ok:true,checks})});return;
    }
    if(location.pathname.startsWith('/karyawan')){
      await wait(()=>document.querySelector('#employee-search')||document.querySelector('#employee-role:not(:disabled)'));
      assert(document.documentElement.scrollWidth<=innerWidth,'employee page has no horizontal overflow');
      assert(document.querySelector('main h1').textContent.includes('karyawan')||document.querySelector('main h1').textContent.includes('Karyawan'),'employee heading renders');
      if(document.querySelector('#employee-search')){
        await wait(()=>document.querySelector('main').textContent.includes('Andi Pratama'));
        if(['1'].includes(new URLSearchParams(location.search).get('review-actions'))){
          const visible=(selector)=>[...document.querySelectorAll(selector)].find(e=>e.getBoundingClientRect().width>0);
          const trigger=visible('button[aria-label="Aksi Andi Pratama"]');
          await wait(()=>trigger&&Object.keys(trigger).some(k=>k.startsWith('__reactFiber$')));
          const openMenu=async()=>{visible('button[aria-label="Aksi Andi Pratama"]').click();await wait(()=>document.querySelector('[role="menu"]'));};
          const item=(label)=>[...document.querySelectorAll('[role="menuitem"]')].find(b=>b.textContent===label);
          const fill=(id,value)=>{const input=document.getElementById(id);Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));};
          await openMenu();
          assert(item('Edit')&&item('Hapus')&&(item('Atur PIN')||item('Reset PIN')),'menu has PIN, Edit and Hapus');
          const rect=document.querySelector('[role="menu"]').getBoundingClientRect();assert(rect.left>=0&&rect.right<=innerWidth,'menu fits viewport and escapes table clipping');
          document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowDown',bubbles:true}));assert(document.activeElement.textContent==='Edit','arrow key moves menu focus');
          document.activeElement.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));await wait(()=>!document.querySelector('[role="menu"]'));assert(document.activeElement===trigger,'Escape closes menu and restores trigger focus');
          await openMenu();item('Edit').click();await wait(()=>document.querySelector('dialog[open] #employee-name'));
          assert(document.getElementById('employee-name').value==='Andi Pratama','edit form is prefilled');
          fill('employee-phone','62812345678');document.querySelector('dialog[open] [type="submit"]').click();
          await wait(()=>!document.querySelector('dialog[open]')&&document.querySelector('main').textContent.includes('Data karyawan berhasil diperbarui'));
          assert(true,'edit saves through API and refreshes list');
          await openMenu();(item('Atur PIN')||item('Reset PIN')).click();await wait(()=>document.querySelector('dialog[open] #employee-pin'));
          assert(document.querySelector('dialog[open] input').type==='password','PIN action opens masked PIN form');
          [...document.querySelectorAll('dialog[open] button')].find(b=>b.textContent==='Batal').click();await wait(()=>!document.querySelector('dialog[open]'));
          const deleteTrigger=visible('button[aria-label="Aksi Budi Santoso"]');
          if(deleteTrigger){deleteTrigger.click();await wait(()=>document.querySelector('[role="menu"]'));item('Hapus').click();await wait(()=>document.querySelector('dialog[open] h2')?.textContent==='Hapus karyawan?');
            assert(document.querySelector('main').textContent.includes('Budi Santoso'),'delete requires confirmation before mutation');
            document.querySelector('dialog[open] [type="submit"]').click();await wait(()=>!document.querySelector('dialog[open]')&&!document.querySelector('main').textContent.includes('Budi Santoso'));assert(true,'confirmed delete removes profile from list');}
          await openMenu();
          assert(getComputedStyle(document.querySelector('.ui-table tbody th')).backgroundColor==='rgba(0, 0, 0, 0)','name cell keeps consistent row hover');
          assert(document.documentElement.scrollWidth<=innerWidth,'no horizontal viewport overflow');
          await fetch('/review-result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path:location.pathname,width:innerWidth,ok:true,checks})});return;
        }
        const status=document.querySelector('#employee-status-filter');
        status.click();await wait(()=>document.querySelector('[role=listbox]'));[...document.querySelectorAll('[role=option]')].find(o=>o.textContent==='Nonaktif').click();
        await wait(()=>document.querySelector('main').textContent.includes('Budi Santoso')&&!document.querySelector('main').textContent.includes('Andi Pratama'));
        assert(true,'inactive filter updates real API query');
        status.click();await wait(()=>document.querySelector('[role=listbox]'));[...document.querySelectorAll('[role=option]')].find(o=>o.textContent==='Semua status').click();
        await wait(()=>document.querySelector('main').textContent.includes('Andi Pratama'));
      }
      await fetch('/review-result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path:location.pathname,width:innerWidth,ok:true,checks})});return;
    }
    if(/^\\/(persediaan|pembelian|resep|keuangan|laporan|pengaturan)$/.test(location.pathname)){
      const parentPath=location.pathname;
      await wait(()=>document.querySelectorAll('.module-menu-card').length>0);
      await wait(()=>Object.keys(document.querySelector('.module-menu-card')).some(key=>key.startsWith('__reactFiber$')));
      const header=document.querySelector('header');
      const cards=[...document.querySelectorAll('.module-menu-card')];
      const first=cards[0];
      assert(cards.every(card=>card.querySelector('h2')&&card.querySelector('p')&&card.querySelector('svg')),'each card has a title, description and Iconsax icon');
      const expectedColumns=innerWidth>=1280?3:innerWidth>=640?2:1;
      const columns=getComputedStyle(first.parentElement).gridTemplateColumns.split(' ').length;
      assert(columns===expectedColumns,'submenu grid adapts to viewport columns');
      assert(Math.max(...cards.map(card=>card.getBoundingClientRect().height))-Math.min(...cards.map(card=>card.getBoundingClientRect().height))<1,'card heights align across the grid');
      first.focus();assert(document.activeElement===first,'cards support keyboard focus');
      if(matchMedia('(prefers-reduced-motion: reduce)').matches)assert(getComputedStyle(first).transitionDuration==='0s','reduced motion disables card transitions');
      const destination=new URL(first.href).pathname;
      const title=first.querySelector('h2').textContent;
      first.click();
      await wait(()=>location.pathname===destination&&document.querySelector('main h1')?.textContent===title);
      assert(document.querySelector('header')===header,'layout persists when a submenu card opens');
      assert(document.querySelector('#erp-desktop-sidebar nav a[href="'+parentPath+'"]').getAttribute('aria-current')==='page','parent sidebar menu stays active in child routes');
      document.querySelector('main a[href="'+parentPath+'"]').click();
      await wait(()=>location.pathname===parentPath&&document.querySelectorAll('.module-menu-card').length===cards.length);
      document.activeElement?.blur();
      assert(document.documentElement.scrollWidth<=innerWidth,'module grid has no horizontal overflow');
      await fetch('/review-result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path:parentPath,width:innerWidth,ok:true,checks})});
      return;
    }
    await wait(()=>document.querySelector('main')?.textContent.includes('Rp3.840.000'));
    const header=document.querySelector('header');
    const sidebar=document.querySelector('#erp-desktop-sidebar');
    const summary=header.querySelector('summary');
    const headerBounds=header.getBoundingClientRect();
    const summaryBounds=summary.getBoundingClientRect();
    assert(headerBounds.height===72,'header keeps a consistent 72px height');
    assert(Math.abs((headerBounds.top+headerBounds.height/2)-(summaryBounds.top+summaryBounds.height/2))<1,'account menu aligns vertically in header');
    assert(summary.querySelectorAll('svg').length===2,'account has one Iconsax profile icon and one dropdown arrow');
    assert(getComputedStyle(summary).listStyleType==='none','native disclosure marker is hidden');
    assert(!header.querySelector('img')&&!sidebar.querySelector('img'),'header and sidebar use icon components instead of images');
    const mobile=window.innerWidth<1024;
    if(mobile){
      header.querySelector('[aria-controls="erp-mobile-sidebar"]').click();
      await wait(()=>document.querySelector('#erp-mobile-sidebar').open);
      assert(document.querySelector('#erp-mobile-sidebar').open,'mobile menu opens as modal');
      document.querySelector('#erp-mobile-sidebar button').click();
      await wait(()=>!document.querySelector('#erp-mobile-sidebar').open);
      assert(!document.querySelector('#erp-mobile-sidebar').open,'mobile menu closes');
    }else{
      header.querySelector('[aria-controls="erp-desktop-sidebar"]').click();
      await wait(()=>sidebar.getBoundingClientRect().width===80);
      header.querySelector('summary').click();
      sidebar.querySelector('nav a[href="/laporan"]').click();
      await wait(()=>location.pathname==='/laporan' && document.querySelector('main h1')?.textContent==='Laporan');
      assert(document.querySelector('header')===header,'header instance persists across routes');
      assert(document.querySelector('#erp-desktop-sidebar')===sidebar,'sidebar instance persists across routes');
      assert(sidebar.getBoundingClientRect().width===80,'sidebar collapsed state persists');
      assert(header.querySelector('details').open,'account disclosure state persists');
      sidebar.querySelector('nav a[href="/"]').click();
      await wait(()=>location.pathname==='/' && document.querySelector('main')?.textContent.includes('Rp3.840.000'));
      header.querySelector('[aria-controls="erp-desktop-sidebar"]').click();
      await wait(()=>sidebar.getBoundingClientRect().width===232);
    }
    const select=header.querySelector('[role=combobox]');
    if(!header.querySelector('details').open)header.querySelector('summary').click();
    select.click();await wait(()=>document.querySelector('[role=listbox]'));[...document.querySelectorAll('[role=option]')].find(o=>o.textContent==='Outlet cadangan').click();
    await wait(()=>document.querySelector('main').textContent.includes('Rp720.000'));
    assert(document.querySelector('main').textContent.includes('Outlet cadangan'),'outlet selection fetches distinct scoped data');
    select.click();await wait(()=>document.querySelector('[role=listbox]'));[...document.querySelectorAll('[role=option]')].find(o=>o.textContent==='Outlet utama').click();
    await wait(()=>document.querySelector('main').textContent.includes('Rp3.840.000'));
    header.querySelector('details').open=false;
    assert(document.documentElement.scrollWidth<=window.innerWidth,'no horizontal viewport overflow');
    await fetch('/review-result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({width:innerWidth,ok:true,checks})});
  }catch(error){await fetch('/review-result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({width:innerWidth,ok:false,checks,error:String(error),path:location.pathname,hasAmount:document.body.textContent.includes('Rp3.840.000'),sidebarWidth:document.querySelector('#erp-desktop-sidebar')?.getBoundingClientRect().width,sidebarClass:document.querySelector('#erp-desktop-sidebar')?.className,expanded:document.querySelector('header [aria-controls="erp-desktop-sidebar"]')?.getAttribute('aria-expanded')})});}
})();`;

const proxy = http.createServer(async (req,res) => {
  if (req.url === "/review-result") {
    let body="";for await(const chunk of req)body+=chunk;
    console.log("BROWSER_REVIEW",body);res.end("ok");return;
  }
  const upstream=http.request({ hostname:"127.0.0.1",port:3157,path:req.url,method:req.method,
    headers:{...req.headers,host:"127.0.0.1:3157",cookie,origin:"http://127.0.0.1:3157","accept-encoding":"identity"} },response=>{
    const headers={...response.headers};
    if(headers["content-type"]?.includes("text/html")){
      let html="";response.setEncoding("utf8");response.on("data",chunk=>html+=chunk);
      response.on("end",()=>{delete headers["content-length"];headers["set-cookie"]=cookies;
        res.writeHead(response.statusCode,headers);res.end(html.replace("</body>",()=>'<script>'+browserChecks+'</script></body>'));});
    }else{res.writeHead(response.statusCode,headers);response.pipe(res);}
  });
  upstream.on("error",()=>{res.statusCode=502;res.end("Review upstream unavailable");});req.pipe(upstream);
});
await new Promise(resolve=>proxy.listen(3190,"127.0.0.1",resolve));
console.log("Review ready: http://127.0.0.1:3190/ (fake data only)");
async function close(){
  proxy.close();fake.close();frontend.close();await app.close();
  setTimeout(()=>process.exit(0),500);
}
process.on('SIGINT',close);process.on('SIGTERM',close);
