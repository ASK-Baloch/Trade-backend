import mongoose,{Schema} from "mongoose";

const videoschema=new Schema({
    category:{
        type:String,
        required:true
    },
    category_videos:[
        {
            heading:{
                type:String
            },
            title:{
                type:String
            },
            description:{
                type:String
            },
            url:{
                type:String
            }
        }
    ]
})

export const Video=mongoose.model("Video",videoschema)