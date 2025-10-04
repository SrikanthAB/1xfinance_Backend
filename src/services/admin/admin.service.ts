import { Admin } from "../../models";
import ApiError from "../../utils/ApiError";
import { IAdmin } from "../../interfaces/admin";
import jwtToken from "../../services/user/jwtToken.service";
import { tokenTypes } from "../../config/tokens";

const AdminServices = {
  async adminLogin({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{ accessToken: string; refreshToken: string }> {
    const admin = await Admin.findOne({ email });

    if (!admin) {
      throw new ApiError({
        statusCode: 401,
        message: "Invalid email",
      });
    }

    const isMatch = await admin.isPasswordMatch(password);
    if (!isMatch) {
      throw new ApiError({
        statusCode: 401,
        message: "Invalid password.",
      });
    }

    const [accessToken, refreshToken] = await Promise.all([
      jwtToken.generate({
        payload: { _id: admin._id as string, role: admin.role },
        tokenType: tokenTypes.ADMIN_ACCESS as keyof typeof tokenTypes,
      }),
      jwtToken.generate({
        payload: { _id: admin._id as string, role: admin.role },
        tokenType: tokenTypes.ADMIN_REFRESH as keyof typeof tokenTypes,
      }),
    ]);

    return { accessToken, refreshToken };
  },

  async getAdminDetails(adminId: string): Promise<Partial<IAdmin>> {
    const admin = await Admin.findById(adminId).select('-password -__v -createdAt -updatedAt').lean();
    
    if (!admin) {
      throw new ApiError({
        statusCode: 404,
        message: 'Admin not found',
      });
    }
    
    // Return only the necessary fields
    const { _id, fullName, email, address, contactNumber, avatar, role, walletAddress } = admin;
    return {
      _id,
      fullName,
      email,
      address,
      contactNumber,
      avatar,
      role,
      walletAddress,
    };
  }
};

export default AdminServices;
