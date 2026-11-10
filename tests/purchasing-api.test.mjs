import { test, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";
import path from "node:path";
import { loadSource, sourceRoot } from "./support/load-source.mjs";
const id="71000000-0000-0000-0000-000000000001";
const user={id,email:"purchase@example.invalid",aud:"authenticated",role:"authenticated",app_metadata:{},user_metadata:{},created_at:new Date().toISOString()};
let permissions=["purchasing.read","purchasing.manage","inventory.read","inventory.manage","finance.read","finance.manage"];
let role="Pemilik", calls=[], failure;
const fake=http.createServer(async(req,res)=>{
  res.setHeader("Content-Type","application/json");let raw="";for await(const chunk of req)raw+=chunk;
  if(req.url.startsWith("/auth/v1/token")){const encode=v=>Buffer.from(JSON.stringify(v)).toString("base64url");res.end(JSON.stringify({access_token:`${encode({alg:"HS256"})}.${encode({sub:id,exp:Math.floor(Date.now()/1000)+3600})}.test`,refresh_token:"test-refresh",expires_in:3600,token_type:"bearer",user}));}
  else if(req.url==="/auth/v1/user")res.end(JSON.stringify(user));
  else if(req.url==="/rest/v1/rpc/my_access")res.end(JSON.stringify([{employee_id:id,restaurant_id:id,outlet_id:id,outlet_name:"Outlet",role,permissions}]));
  else if(req.url==="/rest/v1/rpc/simple_purchasing"){calls.push(JSON.parse(raw));if(failure){res.statusCode=400;res.end(JSON.stringify(failure));}else res.end(JSON.stringify({id,items:[],total:0}));}
  else{res.statusCode=404;res.end("{}");}
});
after(()=>new Promise(resolve=>fake.close(resolve)));
test("purchasing validates input, rejects CSRF and missing permissions, scopes RPC and hides internal failures",async()=>{
  await new Promise(resolve=>fake.listen(0,"127.0.0.1",resolve));
  process.env.NEXT_PUBLIC_SUPABASE_URL=`http://127.0.0.1:${fake.address().port}`;process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="test-key";
  const handler=loadSource(path.join(sourceRoot,"src/pages/api/purchasing/index.ts")).default;
  const upload=loadSource(path.join(sourceRoot,"src/pages/api/purchasing/upload.ts")).default;
  const auth=loadSource(path.join(sourceRoot,"src/pages/api/auth/[action].ts")).default;
  async function request(options={},target=handler){const headers=new Map();const res={setHeader(k,v){headers.set(k.toLowerCase(),v);},getHeader(k){return headers.get(k.toLowerCase());},status(s){this.statusCode=s;return this;},json(v){this.body=v;}};await target({method:"GET",query:{outletId:id,view:"purchases"},...options,headers:{host:"localhost:3000",origin:"http://localhost:3000","content-type":"application/json",...options.headers}},res);return {...res,headers};}
  const login=await request({method:"POST",query:{action:"login"},body:{email:user.email,password:"test-password"}},auth);
  const cookie=login.headers.get("set-cookie").map(v=>v.split(";")[0]).join("; ");
  assert.equal((await request()).statusCode,401);
  assert.equal((await request({headers:{cookie}})).statusCode,200);
  assert.equal(calls.at(-1).p_outlet_id,id);
  const body={outletId:id,action:"supplier",data:{name:"Supplier",email:"",phone:"",contact:"",payment_terms_days:7,active:true}};
  assert.equal((await request({method:"POST",headers:{cookie,origin:"https://evil.invalid"},body})).statusCode,403);
  const before=calls.length;
  assert.equal((await request({method:"POST",headers:{cookie},body:{...body,data:{...body.data,payment_terms_days:-1}}})).statusCode,400);
  assert.equal(calls.length,before);
  assert.equal((await request({method:"POST",headers:{cookie},body})).statusCode,201);
  const invalidFile={method:"POST",query:{outletId:id,requestId:id},headers:{cookie,"content-type":"application/pdf"},async *[Symbol.asyncIterator](){yield Buffer.from("not a PDF");}};
  assert.equal((await request(invalidFile,upload)).statusCode,415);
  assert.equal((await request({...invalidFile,async *[Symbol.asyncIterator](){yield Buffer.alloc(8388609);}},upload)).statusCode,413);
  permissions=["purchasing.read"];
  assert.equal((await request({method:"POST",headers:{cookie},body})).statusCode,403);
  role="Kasir";
  assert.equal((await request({headers:{cookie}})).statusCode,401);
  role="Pemilik";permissions.push("purchasing.manage");failure={code:"XX000",message:"sensitive internal query"};
  const unavailable=await request({headers:{cookie}});assert.equal(unavailable.statusCode,503);assert.ok(!JSON.stringify(unavailable.body).includes("sensitive"));
});
