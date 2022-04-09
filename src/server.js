require('dotenv').config();
const express=require('express');
const bcrypt = require('bcryptjs');
const jwt=require('jsonwebtoken');
const cookieParser=require('cookie-parser');
const path=require('path');
const app=express();
const PORT=process.env.PORT || 3800;
require('./db/connection');
const Employee=require('./models/userschema');
const static_path=path.join(__dirname,"../public");
app.use(express.json());
app.use(cookieParser());
const auth=require('./middleware/auth');
app.use(express.urlencoded({extended:true}));
app.use(express.static(static_path));
app.set('view engine','ejs')
app.get('/',(req,res)=>{
    res.render('index')
})

app.get('/login',(req,res)=>{
    res.render('login');
});

app.get('/register',(req,res)=>{
    res.render('register');
});

app.post('/register',async(req,res)=>{
    try{
      const password=req.body.password;
      const confirmpassword=req.body.confirmpassword;
      if(password===confirmpassword){

        const registerEmployee=new Employee({
            name:req.body.name,
            email:req.body.email,
            password:req.body.password,
            confirmpassword:req.body.confirmpassword
        })
        const token=await registerEmployee.generateAuthToken();
        console.log(token);

        res.cookie("jwt",token,{
            expires:new Date(Date.now()+30000),
            httpOnly:true
        });

         const registered= await registerEmployee.save();
         res.status(201).render('index');

      }else{
          res.send(400).status('password are not matching');
      }
    }catch(error){
       res.status(400).send(error);
    }
})
app.post('/login',async(req,res)=>{
    try{
        const email=req.body.email;
        const password=req.body.password;
        const userLogin=await Employee.findOne({email:email});
        const  isMatch= await bcrypt.compare(password,userLogin.password);
        const token=await userLogin.generateAuthToken();
        console.log(token);

        res.cookie("jwt",token,{
            expires:new Date(Date.now()+600000),
            httpOnly:true
          
        });

        if(isMatch){
           
            res.status(201).render('dashboard');
           
        }else{
            res.send('invalid details');
        }
        
    }catch(error){
        res.status(400).send(error);
    }
})

app.get('/dashboard',auth,(req,res)=>{
    console.log(`cookie value:${req.cookies.jwt}`);
    
        res.render('dashboard');

 
});
app.get('/logout',auth,async(req,res)=>{
    try{
        res.clearCookie('jwt');
        console.log('logout successfully');
        await req.user.save();
        res.render('login');
    }catch(error){
        res.status(500).send(error);
    }
})

app.listen(PORT,()=>{
    console.log(`server is running at port ${PORT}`);
});