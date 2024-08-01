import { useEffect } from "react";

const useScrollDetection = () => {
  const handleScroll = (event: Event) => {
    const target = event.target as HTMLElement;
    console.log("Scrolling element:", target);
  };

  useEffect(() => {
    document.addEventListener("scroll", handleScroll, true); // Capture phase

    // Cleanup event listener on component unmount
    return () => {
      document.removeEventListener("scroll", handleScroll, true);
    };
  }, []);
};

export default useScrollDetection;
