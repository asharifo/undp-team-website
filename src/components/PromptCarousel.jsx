import "../css/PromptCarousel.css";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { Observer } from "gsap/Observer";

// Refactor into two components
const prompts = [
  "What are the recommended evacuation routes for wildfires in my region?",
  "How should I prepare my family for a possible tsunami warning?",
  "What emergency kit items are essential for earthquake evacuation?",
  "When will authorities issue evacuation orders for hurricanes?",
  "Provide recent flood frequency statistics in my country.",
  "What is the average annual number of earthquakes in my region?",
  "Show historical data on landslide incidents locally.",
  "Which natural disasters pose the greatest risk here?",
  "How can I develop a family evacuation plan for cyclones?",
  "Where can I find approved shelters during severe storms?",
  "Who coordinates local disaster response efforts?",
  "What communication channels are used for evacuation alerts?",
];

export default function PromptCarousel( { onPromptSelect } ) {
  const containerRef = useRef(null);
  const scrollTimelineRef = useRef(null);
  const duplicatedPrompts = [...prompts, ...prompts];
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Create infinite scroll animation
    const totalWidth = container.scrollWidth / 2;

    scrollTimelineRef.current = gsap.timeline({ repeat: -1 });
    scrollTimelineRef.current.to(container, {
      x: -totalWidth,
      duration: 70,
      ease: "none",
    });
    return () => {
      scrollTimelineRef.current?.kill();
    };
  }, []);
  const handleMouseEnter = () => {
    scrollTimelineRef.current?.pause();
  };

  const handleMouseLeave = () => {
    scrollTimelineRef.current?.resume();
  };

  const handleBubbleHover = (e) => {
    gsap.to(e.currentTarget, {
      y: -8,
      scale: 1.05,
      duration: 0.1,
      ease: "none",
    });
  };

  const handleBubbleLeave = (e) => {
    gsap.to(e.currentTarget, {
      y: 0,
      scale: 1,
      duration: 0.1,
      ease: "none",
    });
  };
  return (
    <div className="prompt-carousel">
      <div
        className="marquee"
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {duplicatedPrompts.map((prompt, index) => (
          <div
            key={`${prompt.id}-${index}`}
            className="prompt"
            onMouseEnter={handleBubbleHover}
            onMouseLeave={handleBubbleLeave}
            onClick={() => onPromptSelect(prompt)}
          >
            {prompt}
          </div>
        ))}
      </div>
    </div>
  );
}
