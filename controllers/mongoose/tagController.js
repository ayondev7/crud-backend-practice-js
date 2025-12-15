import Tag from "../../models/mongoose/Tag.js";

export const getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find();
    res.status(200).json({
      success: true,
      message:"Tags fetched succesfully",
      count: tags.length,
      data: tags,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSingleTag = async (req, res) => {
  const { id } = req.params;

  try {
    if (!id) {
      return res
        .status(404)
        .json({ success: false, message: "Tag not found!" });
    }

    const tag = await Tag.findById(id);
    return res.status(200).json({
        success:true,
        message:"Tag fetched successfully",
        data:tag
    });
  } catch (error) {
    return res.status(500).json({
        success:false,
        message:error.message
    })
  }
};

export const getTagsByType = async (req,res)=> {
    const {type} = req.query;

    const query = {};
    if(type){
        query.type=type;
    }

    try {
        const tags = await Tag.find(query);
        return res.status(200).json({
            success:true,
            message:"Fetched tags successfully",
            data:tags
        });
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
}
