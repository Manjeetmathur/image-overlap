import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const mergeWithTopBottom = async (req, res) => {
  try {
    const uploadedImage = req.file;
    if (!uploadedImage) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const topImagePath = path.join(__dirname, "../top.png");
    const bottomImagePath = path.join(__dirname, "../bottom.png");
    const uploadedImagePath = uploadedImage.path;

    // Get metadata of uploaded image
    const middleMeta = await sharp(uploadedImagePath).metadata();
    const imageWidth = middleMeta.width;
    const imageHeight = middleMeta.height;

    // Resize top and bottom images to exactly match uploaded image's width
    const topBuffer = await sharp(topImagePath)
      .resize({ width: imageWidth,height:imageHeight, withoutEnlargement: true ,fit:'fill'})
      .png()
      .toBuffer();
    const middleBuffer = await sharp(uploadedImagePath)
      .png()
      .toBuffer();
    const bottomBuffer = await sharp(bottomImagePath)
      .resize({ width: imageWidth,height:imageHeight, withoutEnlargement: true,fit:'fill' })
      .png()
      .toBuffer();

    // Get metadata for positioning
    const topMeta = await sharp(topBuffer).metadata();
    const bottomMeta = await sharp(bottomBuffer).metadata();

    // Ensure top and bottom images fit within the base image height
    const topBufferSafe = topMeta.height > imageHeight
      ? await sharp(topBuffer).resize({ width: imageWidth, height: imageHeight, fit: 'inside', withoutEnlargement: true }).png().toBuffer()
      : topBuffer;
    const bottomBufferSafe = bottomMeta.height > imageHeight
      ? await sharp(bottomBuffer).resize({ width: imageWidth, height: imageHeight, fit: 'inside', withoutEnlargement: true }).png().toBuffer()
      : bottomBuffer;

    // Update metadata after potential resize
    const topMetaSafe = await sharp(topBufferSafe).metadata();
    const bottomMetaSafe = await sharp(bottomBufferSafe).metadata();

    // Ensure bottom image fits within the base image height for positioning
    const bottomTopPosition = Math.max(0, imageHeight - bottomMetaSafe.height);

    // Use uploaded image as base and composite top and bottom images
    await sharp(middleBuffer)
      .composite([
        { input: topBufferSafe, top: 0, left: 0 }, // Top image at the top
        { input: bottomBufferSafe, top: bottomTopPosition, left: 0 }, // Bottom image at the bottom
      ])
      .png()
      .toFile(path.join(__dirname, "../merged-output/merged.png"));

    res.status(200).json({
      message: "Image merged successfully with matching width and perfect overlap",
      mergedImageUrl: "/merged/merged.png",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Merge failed", error: err.message });
  }
};