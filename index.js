const express=require('express');
const axios=require('axios');
const app=express();
app.use(express.json());
const SC="714777";
const VALID_ACCOUNT="440200282954";
const B="https://starlife-mpesa-backend.vercel.app";
const C=B+"/api/confirmation";
const V=B+"/api/validation";
const D="https://api.safaricom.co.ke";
const K="6Vy70jQRqGv3lGP68qItn4yKbL5UOuxHImcgNgh4s9KKHCrMAY1o0AA3Mjtcf0we";
const S="7dV44d1vPw1g3EXEGGJlKNbQ4Q6VudTU9RyFoi2AEnqf0ZPF";

app.get('/',(req,res)=>{res.send('STARLIFE Paybill '+SC+' Account '+VALID_ACCOUNT+' Ready!');});

app.post('/api/validation',(req,res)=>{
const acc=req.body.BillRefNumber;
console.log("Validating account:",acc);
if(acc==VALID_ACCOUNT){
res.json({ResultCode:0,ResultDesc:"Accepted"});
}else{
res.json({ResultCode:1,ResultDesc:"Invalid Account - Use 440200282954"});
}
});

app.post('/api/confirmation',(req,res)=>{
console.log("PAYMENT RECEIVED:",JSON.stringify(req.body));
res.json({ResultCode:0,ResultDesc:"Success"});
});

app.get('/api/register',async(req,res)=>{
try{
const a=Buffer.from(K+":"+S).toString('base64');
const t=await axios.get(D+"/oauth/v1/generate?grant_type=client_credentials",{headers:{Authorization:"Basic "+a}});
const k=t.data.access_token;
const q=await axios.post(D+"/mpesa/c2b/v1/registerurl",{ShortCode:SC,ResponseType:"Completed",ConfirmationURL:C,ValidationURL:V},{headers:{Authorization:"Bearer "+k}});
res.json(q.data);
}catch(e){res.status(500).json({safaricom_error:e.response?.data,status:e.response?.status});}
});
module.exports=app;
