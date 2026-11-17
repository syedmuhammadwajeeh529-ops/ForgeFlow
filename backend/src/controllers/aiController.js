import {successResponse} from '../utils/apiResponse.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import {AppError} from '../utils/AppError.js';
export const generateWithAI=asyncHandler(async(req,res)=>{
 const key=process.env.AI_API_KEY;if(!key)throw new AppError('AI generation is not configured. Add AI_API_KEY to backend/.env.',503);
 const base=(process.env.AI_BASE_URL||'https://api.openai.com/v1').replace(/\/$/,'');const model=process.env.AI_MODEL||'gpt-4o-mini';
 const schema=req.body.response_json_schema?'\n\nReturn data matching this JSON schema exactly:\n'+JSON.stringify(req.body.response_json_schema):'';
 const messages=[{role:'system',content:'You are ForgeFlow, a practical software project ideation assistant. Follow the user request and return useful, concrete output as valid JSON.'},{role:'user',content:(req.body.prompt||'Generate a useful software project idea.')+schema}];
 const response=await fetch(base+'/chat/completions',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({model,messages,response_format:{type:'json_object'}})});
 const payload=await response.json().catch(()=>({}));if(!response.ok)throw new AppError(payload.error?.message||'The AI provider request failed.',502);
 let result={};try{result=JSON.parse(payload.choices?.[0]?.message?.content||'{}')}catch{throw new AppError('The AI provider returned invalid JSON.',502)}
 return successResponse(res,result,'AI response generated.');
});
