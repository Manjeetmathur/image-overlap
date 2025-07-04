import { uploadOnCloudinary } from "../middleware/multer.js";
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const filePath = req?.file?.path
    const uploaded = await uploadOnCloudinary(filePath);
    res.send(uploaded.url);
    // res.status(200).json({
    //   message: "Image uploaded successfully",
    //   url: uploaded.secure_url,
    //   public_id: uploaded.public_id,
    // });
  } catch (error) {
    console.error("Upload failed:", error);
    res.status(500).json({ message: "Upload failed", error: error.message });
  }
};
