import Product from "../../models/mongoose/Product.js";


export const getFilteredProducts = async (req, res) => {
  const { minPrice, maxPrice } = req.query;

  const query = {};
  query.isActive = true;

  if (maxPrice || minPrice) {
    query.price = {};
    if (maxPrice) {
      query.price.$lte = Number(maxPrice);
    }
    if (minPrice) {
      query.price.$gte = Number(minPrice);
    }
  }

  try {
    const products = await Product.find(query);
    return res.status(200).json({
      success:true,
      message:"Fetched filtered products successfully",
      data:products
    });
  } catch (error) {
    res.status(500).json({
      success:false,
      message:error.message
    });
  }
};
