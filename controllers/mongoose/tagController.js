import Tag from '../../models/mongoose/Tag.js';

export const getAllTags = async(req,res)=> {
    try{
        const tags = await Tag.find();
        res.status(200).json({
            success:true,
            count:tags.length,
            data:tags
        });
    }catch(error){
        res.status(500).json({success:false,error:error.message});
    }
};