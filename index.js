const express = require('express');
const path = require('path');
const app = express();

app.use(express.static(__dirname));
app.use(express.json());
app.use((req,res,next)=>{res.header('Access-Control-Allow-Origin','*');res.header('Access-Control-Allow-Methods','*');res.header('Access-Control-Allow-Headers','*');next();});

const BIN_URL = "https://api.npoint.io/b798a9decc5699e74b52";

async function getDB(){
  const r = await fetch(BIN_URL);
  return await r.json();
}
async function saveDB(data){
  await fetch(BIN_URL,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(data)});
}

app.get('/api/payments', async (req,res)=>{
  try{
    const db = await getDB();
    res.json(db);
  }catch(e){res.status(500).json({error:e.message})}
});

app.post('/api/submit', async (req,res)=>{
  const {name, phone, code} = req.body;
  const db = await getDB();
  if(!db.pending) db.pending = [];
  if(!db.approved) db.approved = [];
  db.pending.push({name, phone, code, time:new Date().toLocaleString()});
  await saveDB(db);
  res.json({success:true});
});

app.post('/api/approve', async (req,res)=>{
  const {index} = req.body;
  const db = await getDB();
  const user = db.pending.splice(index,1)[0];
  if(user){ db.approved.push(user); await saveDB(db); }
  res.json({success:true, user});
});

app.post('/api/reject', async (req,res)=>{
  const {index} = req.body;
  const db = await getDB();
  db.pending.splice(index,1);
  await saveDB(db);
  res.json({success:true});
});

app.post('/api/callback', async (req,res)=>{
  try{
    const db = await getDB();
    if(!db.pending) db.pending = [];
    db.pending.push({name:"Mpesa User", phone:"Mpesa Callback", code:JSON.stringify(req.body).slice(0,100), time:new Date().toLocaleString()});
    await saveDB(db);
  }catch(e){}
  res.json({ResultCode:0});
});

app.get('/', (req,res)=> res.send('STARLIFE Backend Running - DB: '+BIN_URL));

module.exports = app;
