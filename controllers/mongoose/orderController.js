import Order from '../../models/mongoose/Order.js';

export const getOrdersWithUserAndProductDetails = async (req,res) =>{
    const {id} = req.params;

    try {
        const orders = await Order.findById(id)
        .populate({
            path:'user',
            select:'firstName lastName email'
        })
        .populate({
            path:'items.product',
            select:'name images'
        });

        return res.status(200).json({
            success:true,
            message:'fetched data successfully',
            data:orders
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        });
    }
    
}