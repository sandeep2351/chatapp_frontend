const { default: mongoose } = require("mongoose");

const channelSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    members:[{type:mongoose.Schema.ObjectId,ref:"Users",required:true }],
    admin:{type:mongoose.Schema.ObjectId,ref:"Users",required:true},
    messages:[{type:mongoose.Schema.ObjectId,ref:"Messages",required:false}],
    createdAt:{
        type:Date,
        default:Date.now(),
    },
    updatedAt:{
        type:Date,
        default:Date.now(),
    },
})


channelSchema.pre("save",function(next){
    this.updatedAt=Date.now();
    next();
})

channelSchema.pre("findOneAndUpdate",function(next){
    this.set({updateAt:Date.now()});
    next();
})


const channel=mongoose.model("channels",channelSchema);
module.exports=channel;