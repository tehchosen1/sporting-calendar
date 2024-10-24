const { execSync } = require("child_process");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const directoryPath = "./public/photos";
const resizedPath = path.join(directoryPath, "cropped");
if (!fs.existsSync(resizedPath)) {
  fs.mkdirSync(resizedPath);
}

const targetWidth = 800;
const targetAspectRatio = 10 / 16;

async function processImages() {
  const files = fs
    .readdirSync(directoryPath)
    .filter((file) =>
      [".jpg", ".jpeg", ".png", ".webp", ".gif", ".tiff"].includes(
        path.extname(file).toLowerCase()
      )
    );

  for (const file of files) {
    const inputPath = path.join(directoryPath, file);
    const outputPath = path.join(resizedPath, file);

    try {
      // Call the Python script and capture its output
      const faceData = execSync(`python detect_faces.py ${inputPath}`)
        .toString()
        .trim();

      // Parse the output as JSON
      let faces;
      try {
        faces = JSON.parse(faceData);
      } catch (parseError) {
        throw new Error(`Invalid JSON output: ${faceData}`);
      }

      let sharpInstance = sharp(inputPath);
      const { width: imageWidth, height: imageHeight } =
        await sharpInstance.metadata();

      // If faces are detected, center the first face horizontally
      if (faces.length > 0) {
        const face = faces[0];
        const faceCenterX = (face[0] + face[2]) / 2;
        const offsetX = Math.round(imageWidth / 2 - faceCenterX);

        // Extend the image if necessary
        if (offsetX !== 0) {
          sharpInstance = sharpInstance.extend({
            top: 0,
            bottom: 0,
            left: Math.max(0, offsetX),
            right: Math.max(0, -offsetX),
            background: { r: 0, g: 0, b: 0 },
          });
        }

        // Recalculate dimensions after potential extension
        const { width: newWidth, height: newHeight } =
          await sharpInstance.metadata();

        // Safely extract the centered area
        const extractWidth = Math.min(imageWidth, newWidth);
        const extractLeft = Math.max(
          0,
          Math.round((newWidth - imageWidth) / 2)
        );
        sharpInstance = sharpInstance.extract({
          left: extractLeft,
          top: 0,
          width: extractWidth,
          height: newHeight,
        });
      }

      // Recalculate dimensions after centering
      const { width: centeredWidth, height: centeredHeight } =
        await sharpInstance.metadata();

      // Calculate dimensions for 10:16 aspect ratio
      let newWidth, newHeight;
      if (centeredWidth / centeredHeight > targetAspectRatio) {
        newHeight = centeredHeight;
        newWidth = Math.round(newHeight * targetAspectRatio);
      } else {
        newWidth = centeredWidth;
        newHeight = Math.round(newWidth / targetAspectRatio);
      }

      // Crop to 10:16 aspect ratio
      const cropLeft = Math.round((centeredWidth - newWidth) / 2);
      const cropTop = Math.round((centeredHeight - newHeight) / 2);
      sharpInstance = sharpInstance.extract({
        left: Math.max(0, cropLeft),
        top: Math.max(0, cropTop),
        width: Math.min(newWidth, centeredWidth),
        height: Math.min(newHeight, centeredHeight),
      });

      // Resize to target width if necessary
      if (newWidth !== targetWidth) {
        sharpInstance = sharpInstance.resize(targetWidth);
      }

      // Save the output image
      await sharpInstance.toFile(outputPath);
      console.log(`Processed and saved: ${file}`);
    } catch (err) {
      console.error(`Error processing file ${file}:`, err.message);
    }
  }
}

processImages();
