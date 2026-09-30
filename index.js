const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(__dirname));
app.use(express.json());
app.use((req,res,next)=>{res.header('Access-Control-Allow-Origin','*');res.header('Access-Control-Allow-Headers','Content-Type');res.header('Access-Control-Allow-Methods','GET,POST,OPTIONS');if(req.method==='OPTIONS')return res.sendStatus(200);next();});

// !! WEKA BIN_URL YAKO HALISI HAPA - copy kutoka code yako ya zamani !!
const BIN_URL = "https://api.npoint.io/b798a9f5b8c9d4e6f123"; // <-- BADILISHA HII NA YAKO

async function getDB(){
 try{
  const r = await fetch(BIN_URL);
  const data = await r.json();
  return Array.isArray(data) ? data : (data.payments || []);
 }catch(e){ return []; }
}
async function saveDB(data){
 await fetch(BIN_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
}

// User submits payment
app.post('/api/submit', async (req,res)=>{
 const {name,phone,code} = req.body;
 if(!name||!phone||!code) return res.json({success:false,message:'Missing'});
 const db = await getDB();
 db.push({id:Date.now(),name,phone,code:code.toUpperCase().trim(),status:'pending',time:new Date().toISOString()});
 await saveDB(db);
 res.json({success:true});
});

// Admin get all
app.get('/api/payments', async (req,res)=>{
 const db = await getDB();
 res.json(db.reverse());
});

// Admin approve / reject
app.post('/api/approve', async (req,res)=>{
 const {code,status} = req.body;
 const db = await getDB();
 const p = db.find(x=>x.code===code.toUpperCase().trim());
 if(p) p.status = status;
 await saveDB(db);
 res.json({success:true});
});

// Check status for user
app.get('/api/check/:code', async (req,res)=>{
 const db = await getDB();
 const p = db.find(x=>x.code===req.params.code.toUpperCase().trim());
 if(!p) return res.json({status:'not_found'});
 res.json({status:p.status,name:p.name});
});

app.get('/', (req,res)=>{res.send('STARLIFE Backend Running');});

module.exports = app;
