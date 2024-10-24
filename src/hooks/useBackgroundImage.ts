import { useState, useEffect } from "react";

const useBackgroundImage = () => {
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(
    null
  );
  const [imageUsageCount, setImageUsageCount] = useState<{
    [key: string]: number;
  }>({});

  const importAll = (r: __WebpackModuleApi.RequireContext) => {
    return r.keys().map(r);
  };

  const fetchBackgroundImage = async () => {
    try {
      const imagePaths: string[] = importAll(
        require.context(
          "../../public/photos/cropped/",
          true,
          /\.(png|jpe?g|svg)$/
        )
      ) as string[];

      if (imagePaths.length > 0) {
        let storedUsageCount = JSON.parse(
          localStorage.getItem("imageUsageCount") || "{}"
        );

        // Initialize usage count for all images to 0 if not already set
        imagePaths.forEach((image) => {
          if (storedUsageCount[image] === undefined) {
            storedUsageCount[image] = 0;
          }
        });

        // Check if all images have been used once
        const allUsedOnce = imagePaths.every(
          (image) => storedUsageCount[image] === 1
        );

        if (allUsedOnce) {
          // Reset usage counts
          storedUsageCount = imagePaths.reduce((acc, image) => {
            acc[image] = 0;
            return acc;
          }, {} as { [key: string]: number });
        }

        setImageUsageCount(storedUsageCount);
        localStorage.setItem(
          "imageUsageCount",
          JSON.stringify(storedUsageCount)
        );

        // Select a new background image
        const selectedImage = getWeightedRandomImage(
          imagePaths,
          storedUsageCount
        );
        setBackgroundImageUrl(selectedImage);

        // Update the usage count for the selected image
        const updatedUsageCount = {
          ...storedUsageCount,
          [selectedImage]: (storedUsageCount[selectedImage] || 0) + 1,
        };
        setImageUsageCount(updatedUsageCount);
        localStorage.setItem(
          "imageUsageCount",
          JSON.stringify(updatedUsageCount)
        );
      }
    } catch (error) {
      console.error("Failed to fetch background images:", error);
    }
  };
  useEffect(() => {
    fetchBackgroundImage();
  }, []);

  return { backgroundImageUrl, fetchBackgroundImage };
};

const getWeightedRandomImage = (
  imagePaths: string[],
  usageCount: { [key: string]: number }
): string => {
  const availableImages = imagePaths.filter(
    (image) => (usageCount[image] || 0) < 1
  );

  if (availableImages.length === 0) {
    return imagePaths[Math.floor(Math.random() * imagePaths.length)];
  }

  const weights = availableImages.map(
    (image) => 1 / ((usageCount[image] || 0) + 1)
  );
  const totalWeight = weights.reduce((acc, weight) => acc + weight, 0);
  const randomWeight = Math.random() * totalWeight;

  let cumulativeWeight = 0;
  for (let i = 0; i < availableImages.length; i++) {
    cumulativeWeight += weights[i];
    if (randomWeight <= cumulativeWeight) {
      return availableImages[i];
    }
  }

  // Fallback in case of rounding errors
  return availableImages[availableImages.length - 1];
};

export default useBackgroundImage;
