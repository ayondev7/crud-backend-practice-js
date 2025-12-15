import User from '../../models/mongoose/User.js';

export const getUsers = async (req,res) => {
  const {page} = req.query || 1;
  const {limit} = req.query || 10;
  const skip = (page-1) * limit;

  try {
    const users = await User.find({status:'active'})
    .sort({createdAt:-1}).skip(skip).limit(limit)
    .select('username email createdAt').lean(); 

    const total = await User.countDocuments({status:'active'});

    return res.status(200).json({
      success:true,
      message:`Fetched users for page - ${page}`,
      limit:limit,
      count:users.length,
      total:total,
      data:users
    });

  } catch (error) {
    return res.status(500).json({
      success:false,
      message:error.message
    });
  }
}