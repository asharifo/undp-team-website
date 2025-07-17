// src/components/ImageSlider.jsx
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function ImageSlider({ images }) {
  const sliderRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const slider = sliderRef.current;
    const container = containerRef.current;
    if (!slider || !container) return;

    const totalWidth = slider.scrollWidth - container.clientWidth;

    const animation = gsap.to(slider, {
      x: -totalWidth,
      ease: "none",
      scrollTrigger: {
        trigger: container,
        start: "top top",
        end: `+=${totalWidth * 2}`,
        scrub: 1,
        pin: true,
        anticipatePin: 1,
      }
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);


  return (
    <div ref={containerRef} className="slider-container">
      <div ref={sliderRef} className="image-track">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Slide ${i + 1}`}
            className="slide-image"
          />
        ))}
      </div>
    </div>
  );
}
