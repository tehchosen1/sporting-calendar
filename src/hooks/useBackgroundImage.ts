import { useState, useEffect } from "react";
import { scrapePlayerImage } from "../components/utils/scrapeSportingMatches";

const useBackgroundImage = () => {
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");

  useEffect(() => {
    const fetchBackgroundImage = async () => {
      const imageUrl = await scrapePlayerImage();
      if (imageUrl) setBackgroundImageUrl(imageUrl);
    };

    fetchBackgroundImage();
  }, []);

  return { backgroundImageUrl };
};

export default useBackgroundImage;
