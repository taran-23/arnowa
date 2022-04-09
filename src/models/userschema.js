const mongoose=require('mongoose');
const bcrypt = require('bcryptjs');
const jwt=require('jsonwebtoken');


const UserSchema=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    confirmpassword:{
        type:String,
        required:true
    },
    tokens:[
      {  token:{
            type:String,
            required:true
        }}
    ]
})

UserSchema.methods.generateAuthToken=async function(){
    try{
        const token=jwt.sign({_id:this._id.toString()},process.env.SECRET_KEY);
        this.tokens=this.tokens.concat({token:token})
       await this.save();
        return token;

    }catch(error){
       console.log(error);
    }
}

UserSchema.pre('save',async function(next){
    if(this.isModified('password')){
       this.password= await bcrypt.hash(this.password,12);
       this.confirmpassword= await bcrypt.hash(this.confirmpassword,12);

        next();
    }
  
})
const Employee=new mongoose.model('Employee',UserSchema);

module.exports=Employee;