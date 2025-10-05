import { useState, useEffect } from "react";

interface Stadium {
  id: string;
  name: string;
  image: string;
  team: string;
  capacity?: string;
  city?: string;
}

const useStadiumBackground = (homeTeam: string | null) => {
  const [stadiumImageUrl, setStadiumImageUrl] = useState<string | null>(null);
  const [stadiums, setStadiums] = useState<Stadium[]>([]);

  // Load stadiums data
  useEffect(() => {
    const loadStadiums = async () => {
      try {
        const response = await fetch("/stadiums.json");
        const data = await response.json();
        setStadiums(data);
      } catch (error) {
        console.error("Failed to load stadiums:", error);
      }
    };

    loadStadiums();
  }, []);

  // Update background when home team changes
  useEffect(() => {
    if (!homeTeam || stadiums.length === 0) {
      console.log("[Stadium] No home team or stadiums not loaded", {
        homeTeam,
        stadiumsCount: stadiums.length,
      });
      setStadiumImageUrl(null);
      return;
    }

    console.log("[Stadium] Looking for stadium for home team:", homeTeam);
    console.log("[Stadium] Available teams:", stadiums.map((s) => s.team));

    // Find stadium for the home team
    const stadium = stadiums.find(
      (s) => s.team.toLowerCase() === homeTeam.toLowerCase()
    );

    console.log("[Stadium] Found stadium:", stadium?.name || "none");

    if (stadium && stadium.image) {
      setStadiumImageUrl(stadium.image);
      console.log("[Stadium] Set image URL:", stadium.image);
    } else {
      setStadiumImageUrl(null);
      console.log("[Stadium] No stadium found for:", homeTeam);
    }
  }, [homeTeam, stadiums]);

  return { stadiumImageUrl };
};

export default useStadiumBackground;
