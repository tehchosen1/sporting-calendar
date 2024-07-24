import { useState, useEffect } from "react";
import { scrapePlayerImage } from "../components/utils/scrapeSportingMatches";

const useBackgroundImage = () => {
  const [backgroundImageUrl, setBackgroundImageUrl] = useState<string | null>(
    null
  );
  const [cachedBackgroundImages, setCachedBackgroundImages] = useState<
    string[]
  >([]);

  useEffect(() => {
    const fetchBackgroundImage = async () => {
      // If there are cached images, randomly select one
      if (cachedBackgroundImages.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * cachedBackgroundImages.length
        );
        setBackgroundImageUrl(cachedBackgroundImages[randomIndex]);
      } else {
        // Otherwise, fetch a new image and cache it
        const imageUrl = await scrapePlayerImage();
        if (imageUrl) {
          setBackgroundImageUrl(imageUrl);
          setCachedBackgroundImages((prev) => [...prev, imageUrl]);
        }
      }
    };

    fetchBackgroundImage();
  }, [backgroundImageUrl, cachedBackgroundImages]);

  return { backgroundImageUrl };
};

export default useBackgroundImage;
