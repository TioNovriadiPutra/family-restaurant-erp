export const inventoryBrowserChecks = String.raw`
    if(new URLSearchParams(location.search).has('review-inventory')){
      const fill=(name,value)=>{const input=document.querySelector('main [name="'+name+'"]');assert(input,'field '+name+' exists');Object.getOwnPropertyDescriptor(input.tagName==='TEXTAREA'?HTMLTextAreaElement.prototype:HTMLInputElement.prototype,'value').set.call(input,value);input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));};
      const click=async text=>{await wait(()=>[...document.querySelectorAll('main button')].some(b=>b.textContent.trim()===text&&!b.disabled));const button=[...document.querySelectorAll('main button')].find(b=>b.textContent.trim()===text&&!b.disabled);assert(button,'action '+text+' exists');button.click();await new Promise(r=>setTimeout(r,100));};
      const choose=async(name,text)=>{const trigger=document.querySelector('main [role=combobox][name="'+name+'"]');assert(trigger,'dropdown '+name+' exists');trigger.scrollIntoView({block:'center'});await new Promise(r=>setTimeout(r,100));trigger.click();await wait(()=>document.querySelector('[role=listbox]'));[...document.querySelectorAll('[role=option]')].find(o=>o.textContent.trim()===text).click();await new Promise(r=>setTimeout(r,80));};
      await wait(()=>document.querySelector('main table tbody tr'));
      const path=location.pathname;
      if(path.endsWith('/stok-bahan')){
        assert(document.querySelector('main').textContent.includes('375.000'),'stock value rendered');await click('Mutasi');await wait(()=>document.querySelector('main').textContent.includes('PB-0091'));checks.push('movement history loads through API');
      }else if(path.endsWith('/master-bahan')){
        if(new URLSearchParams(location.search).has('conversion')){
          const trigger=document.querySelector('button[aria-label="Aksi Beras premium"]');trigger.click();await wait(()=>document.querySelector('[role=menu]'));
          [...document.querySelectorAll('[role=menuitem]')].find(b=>b.textContent.includes('Atur konversi')).click();await wait(()=>document.querySelector('#conversion-unit'));
          await choose('unitId','g');fill('baseQuantity','0.001');await click('Simpan konversi');await wait(()=>!document.querySelector('#conversion-unit'));checks.push('conversion update refreshes material units');
        }else{
        await click('Tambah bahan');await wait(()=>document.querySelector('#inventory-name'));
        fill('name','Cabai rawit');await choose('baseUnitId','kg');fill('minimumQuantity','2');await click('Simpan bahan');
        await wait(()=>!document.querySelector('#inventory-name')&&document.querySelector('main').textContent.includes('Cabai rawit'));checks.push('material creation refreshes list');}
      }else if(path.endsWith('/stock-opname')){
        await click('Jadwalkan opname');await wait(()=>document.querySelector('#count-schedule'));fill('notes','Hitung fisik akhir hari');await click('Simpan jadwal');
        await wait(()=>document.querySelector('main').textContent.includes('Mulai hitung'));await click('Mulai hitung');await wait(()=>document.querySelector('#count-quantity-0'));
        fill('lines.0.countedQuantity','23');fill('lines.0.reason','Beras tercecer');await click('Simpan & ajukan');
        await wait(()=>!document.querySelector('#count-quantity-0')&&document.querySelector('main').textContent.includes('Minta akun Pemilik/Manajer lain'));
        assert(![...document.querySelectorAll('main button')].some(b=>b.textContent.includes('Setujui & posting')),'creator cannot approve own count');checks.push('schedule, snapshot, physical count and atomic submit complete');
      }else if(path.endsWith('/persetujuan-opname')){
        await click('Detail');await wait(()=>document.querySelector('main').textContent.includes('Setujui & posting'));await click('Setujui & posting');await wait(()=>document.querySelector('#inventory-review-reason'));await click('Konfirmasi & posting');
        await wait(()=>document.querySelector('main').textContent.includes('Sudah diposting.'));checks.push('reviewer confirmation posts approved document');
      }else{
        const waste=path.endsWith('/bahan-terbuang');await click(waste?'Catat bahan terbuang':'Buat koreksi');await wait(()=>document.querySelector('#adjustment-reason'));
        fill('reason',waste?'Bahan rusak saat penyimpanan':'Koreksi bahan tercecer');await choose('lines.0.itemId','Beras premium');fill('lines.0.quantity','2');await click('Simpan draf');
        await wait(()=>document.querySelector('main').textContent.includes('Ajukan persetujuan'));await click('Ajukan persetujuan');await wait(()=>document.querySelector('main').textContent.includes('Minta akun Pemilik/Manajer lain'));
        checks.push('draft and submit preserve reviewer separation');
      }
      assert(document.documentElement.scrollWidth<=innerWidth+1,'no horizontal page overflow');
      assert(!document.querySelector('select'),'custom dropdowns throughout inventory');
      await fetch('/review-result',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path,width:innerWidth,ok:true,checks})});return;
    }
`;
