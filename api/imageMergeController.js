import sharp from "sharp";
import path from "path";
import fs from "fs/promises";
import axios from "axios";
import FormData from "form-data";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ImgBB API key
const imgbbApiKey = "57e5c2617e80c2dd29dc924d41564574";

export const mergeWithTopBottom = async (req, res) => {
  try {
    const uploadedImage = req.file;
    if (!uploadedImage) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const topImagePath = path.join(__dirname, "../top.png");
    const bottomImagePath = path.join(__dirname, "../bottom.png");
    const uploadedImagePath = uploadedImage.path;

    const middleMeta = await sharp(uploadedImagePath).metadata();
    const imageWidth = middleMeta.width;
    const imageHeight = middleMeta.height;

    const topBuffer = await sharp(topImagePath)
      .resize({ width: imageWidth, height: imageHeight, fit: "fill" })
      .png()
      .toBuffer();

    const middleBuffer = await sharp(uploadedImagePath).png().toBuffer();

    const bottomBuffer = await sharp(bottomImagePath)
      .resize({ width: imageWidth, height: imageHeight, fit: "fill" })
      .png()
      .toBuffer();

    const topMeta = await sharp(topBuffer).metadata();
    const bottomMeta = await sharp(bottomBuffer).metadata();

    const topBufferSafe =
      topMeta.height > imageHeight
        ? await sharp(topBuffer)
            .resize({ width: imageWidth, height: imageHeight, fit: "inside" })
            .png()
            .toBuffer()
        : topBuffer;

    const bottomBufferSafe =
      bottomMeta.height > imageHeight
        ? await sharp(bottomBuffer)
            .resize({ width: imageWidth, height: imageHeight, fit: "inside" })
            .png()
            .toBuffer()
        : bottomBuffer;

    const topMetaSafe = await sharp(topBufferSafe).metadata();
    const bottomMetaSafe = await sharp(bottomBufferSafe).metadata();

    const bottomTopPosition = Math.max(0, imageHeight - bottomMetaSafe.height);

    const outputPath = path.join(__dirname, "../merged-output/merged.png");

    await sharp(middleBuffer)
      .composite([
        { input: topBufferSafe, top: 0, left: 0 },
        { input: bottomBufferSafe, top: bottomTopPosition, left: 0 },
      ])
      .png()
      .toFile(outputPath);

    // ✅ Upload to ImgBB
    const imageData = await fs.readFile(outputPath, { encoding: "base64" });

    const formData = new FormData();
    formData.append("key", imgbbApiKey);
    formData.append("image", imageData);

    const imgbbResponse = await axios.post(
      "https://api.imgbb.com/1/upload",
      formData,
      { headers: formData.getHeaders() }
    );

    const uploadedUrl = imgbbResponse.data.data.url;

    res.status(200).json({
      message: "Image merged and uploaded successfully",
      imageUrl: uploadedUrl,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Merge failed", error: err.message });
  }
};
