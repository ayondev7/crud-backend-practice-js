import Category from '../../models/mongoose/Category.js'
import Post from '../../models/mongoose/Post.js  '

export const getPostsByCategory = async (req,res) => {
  const {slug} = req.params;

 try {
   const category = await Category.findOne({slug});

  if(!category){
    return res.status(404).json({
      success:false,
      message:"Catgeory not found!"
    });
  }

  const posts = await Post.find({
    category:category._id,
    status:'published'
  })

  if(!posts){
    return res.status(404).json({
      success:false,
      message:"No posts found for this category!"
    });
  } else{
    return res.status(200).json({
      success:true,
      message:`Posts fetched for category - ${category.name}`,
      data:posts
    })
  }
  
 } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message
    });
 }
}