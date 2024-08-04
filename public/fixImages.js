const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const directoryPath = "./photos"; // Change this to the path of your images folder
const resizedPath = path.join(directoryPath, "cropped");
const tempPath = path.join(directoryPath, "temp");

if (!fs.existsSync(resizedPath)) {
  fs.mkdirSync(resizedPath);
}

if (!fs.existsSync(tempPath)) {
  fs.mkdirSync(tempPath);
}

async function resizeImages() {
  const files = fs.readdirSync(directoryPath);
  let heights = [];

  // Get the heights of all images
  for (const file of files) {
    const inputPath = path.join(directoryPath, file);
    try {
      const image = sharp(inputPath);
      const metadata = await image.metadata();
      heights.push(metadata.height);
    } catch (err) {
      console.error(`Error processing file ${file}:`, err.message);
    }
  }

  if (heights.length === 0) {
    // console.log("No valid image files found.");
    return;
  }

  // Find the minimum height
  const minHeight = Math.min(...heights);

  // Resize all images to the minimum height while maintaining aspect ratio
  for (const file of files) {
    const inputPath = path.join(directoryPath, file);
    const outputPath = path.join(resizedPath, file);

    try {
      await sharp(inputPath).resize({ height: minHeight }).toFile(outputPath);
      // console.log("Resized image:", file);
    } catch (err) {
      // console.error(`Error resizing image ${file}:`, err.message);
    }
  }
}

async function cropImagesToMinWidth() {
  const files = fs.readdirSync(resizedPath);
  let widths = [];

  // Get the widths of all images
  for (const file of files) {
    const inputPath = path.join(resizedPath, file);
    try {
      const image = sharp(inputPath);
      const metadata = await image.metadata();
      widths.push(metadata.width);
    } catch (err) {
      // console.error(`Error processing file ${file}:`, err.message);
    }
  }

  if (widths.length === 0) {
    // console.log("No valid image files found in resized folder.");
    return;
  }

  // Find the minimum width
  const minWidth = Math.min(...widths);

  // Crop all images to the minimum width while maintaining aspect ratio
  for (const file of files) {
    const inputPath = path.join(resizedPath, file);
    const outputPath = path.join(tempPath, file);

    try {
      const image = sharp(inputPath);
      const metadata = await image.metadata();
      const leftOffset = Math.floor((metadata.width - minWidth) / 2);

      await image
        .extract({
          left: leftOffset,
          top: 0,
          width: minWidth,
          height: metadata.height,
        })
        .toFile(outputPath);
      // console.log("Cropped image:", file);
    } catch (err) {
      // console.error(`Error cropping image ${file}:`, err.message);
    }
  }

  // Move cropped images back to resized folder
  for (const file of files) {
    const tempFilePath = path.join(tempPath, file);
    const finalFilePath = path.join(resizedPath, file);
    fs.renameSync(tempFilePath, finalFilePath);
  }

  // Clean up temporary directory
  fs.rmdirSync(tempPath, { recursive: true });
}

resizeImages().then(() => cropImagesToMinWidth());
