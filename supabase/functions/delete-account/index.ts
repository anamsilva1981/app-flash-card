import { createClient } from "npm:@supabase/supabase-js@2.117.2";
const allowedOrigin="https://anamsilva1981.github.io";
Deno.serve(async (req: Request) => {
 const headers={"Access-Control-Allow-Origin":allowedOrigin,"Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Content-Type":"application/json","Vary":"Origin"};
 const reply=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
 if(req.method==="OPTIONS")return new Response(null,{status:204,headers});
 if(req.method!=="POST")return reply({error:"Method not allowed"},405);
 const token=req.headers.get("Authorization")?.replace(/^Bearer\s+/i,"");
 if(!token)return reply({error:"Unauthorized"},401);
 try {
  const admin=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error}=await admin.auth.getUser(token);
  if(error||!data.user)return reply({error:"Unauthorized"},401);
  const body=await req.json();if(body.confirmation!=="EXCLUIR")return reply({error:"Confirmation required"},400);
  const {error:logoutError}=await admin.auth.admin.signOut(token,"global");
  if(logoutError)return reply({error:"Could not revoke sessions"},503);
  const {error:deleteError}=await admin.auth.admin.deleteUser(data.user.id);
  if(deleteError)return reply({error:"Could not delete account"},503);
  return reply({deleted:true});
 } catch {return reply({error:"Request failed"},400);}
});
