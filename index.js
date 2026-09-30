const express=require('express');const app=express();
app.use(express.json());
app.use((req,res,next)=>{res.header('Access-Control-Allow-Origin','*');res.header('Access-Control-Allow-Headers','Content-Type');res.header('Access-Control-Allow-Methods','GET,POST,OPTIONS');if(req.method==='OPTIONS')return res.sendStatus(200);next();});
let payments=[];
app.post('/api/submit',(req,res)=>{const{name,phone,code}=req.body;payments.push({name,phone,code:code.toUpperCase(),status:'pending',time:new Date().toISOString()});res.json({success:true})});
app.get('/api/payments',(req,res)=>{res.json([...payments].reverse())});
app.post('/api/approve',(req,res)=>{const{code,status}=req.body;const p=payments.find(x=>x.code===code.toUpperCase());if(p)p.status=status;res.json({success:true})});
app.get('/',(req,res)=>{res.send('STARLIFE Running')});
module.exports=app;
