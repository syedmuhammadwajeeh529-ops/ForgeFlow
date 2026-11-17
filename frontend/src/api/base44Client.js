const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '');
export function getToken(){return localStorage.getItem('forgeflow_token')}
export function setToken(token){if(token)localStorage.setItem('forgeflow_token',token);else localStorage.removeItem('forgeflow_token')}
export async function apiRequest(path,options={}){
 const headers={'Content-Type':'application/json',...(options.headers||{})};const token=getToken();if(token)headers.Authorization='Bearer '+token;
 const response=await fetch(API_URL+(path.startsWith('/')?path:'/'+path),{...options,headers,body:options.body&&typeof options.body!=='string'?JSON.stringify(options.body):options.body});
 const payload=response.status===204?null:await response.json().catch(()=>null);
 if(!response.ok||payload?.success===false){const error=new Error(payload?.message||'Request failed ('+response.status+')');error.status=response.status;error.data=payload;throw error}
 return payload?.data??payload;
}
const entityRoutes={ProjectIdea:'/project-ideas',GeneratedIdea:'/generated-ideas',SavedProject:'/saved-projects',ProjectVersion:'/project-versions',FeatureVersion:'/feature-versions'};
const normalize=data=>({...data,tech_stack:Array.isArray(data?.tech_stack)?data.tech_stack:[],tags:Array.isArray(data?.tags)?data.tags:[]});
function entity(name){const route=entityRoutes[name];return{
 async list(sort='-created_date',limit=50){const result=await apiRequest(route+'?limit='+limit+'&sort='+encodeURIComponent(sort));return(Array.isArray(result)?result:result?.items||[]).map(normalize)},
 async filter(filters={},sort='-created_date',limit=50){const params=new URLSearchParams({...Object.fromEntries(Object.entries(filters).map(([k,v])=>[k,String(v)])),sort,limit:String(limit)});const result=await apiRequest(route+'?'+params.toString());return(Array.isArray(result)?result:result?.items||[]).map(normalize)},
 async create(data){return normalize(await apiRequest(route,{method:'POST',body:data}))},
 async bulkCreate(items){return Promise.all(items.map(item=>this.create(item)))},
 async update(id,data){return normalize(await apiRequest(route+'/'+id,{method:'PATCH',body:data}))},
 async delete(id){return apiRequest(route+'/'+id,{method:'DELETE'})}
}}
export const base44={entities:Object.fromEntries(Object.keys(entityRoutes).map(name=>[name,entity(name)])),auth:{async me(){return apiRequest('/auth/me')},logout(){setToken(null)},redirectToLogin(returnUrl=window.location.href){window.location.href='/login?returnTo='+encodeURIComponent(returnUrl)}},integrations:{Core:{async InvokeLLM({prompt,response_json_schema,add_context_from_internet=false}){return apiRequest('/ai/generate',{method:'POST',body:{prompt,response_json_schema,add_context_from_internet}})}}}};
