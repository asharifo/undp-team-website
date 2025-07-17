import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";

gsap.registerPlugin(Draggable, InertiaPlugin);
export default function ImageSlider({ images }) {
  const containerRef = useRef(null);
  const trackRef     = useRef(null);
  useEffect(() => {
    const container = containerRef.current;
    const track     = trackRef.current;
    if (!container || !track) return;

    const maxDrag = track.scrollWidth - container.offsetWidth;
    const buffer  = window.innerWidth * 0.5;

    Draggable.create(track, {
      type:      "x",
      bounds:    {
        minX: -maxDrag - buffer,
        maxX: buffer
      },
      inertia:   true,
      dragResistance:  0.3,    
      throwResistance: 2000,
      cursor:    "grab",
      onPress() { this.cursor = "grabbing"; },
      onRelease() { this.cursor = "grab"; },
    });
  }, []);

  const expandImage = (img) => {
    const rect = img.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // choose scale so image covers the viewport
    const scaleX = vw / rect.width;
    const scaleY = vh / rect.height;
    const scale = Math.max(scaleX, scaleY);

    // compute translation to center
    const x = vw / 2 - (rect.left + rect.width / 2);
    const y = vh / 2 - (rect.top + rect.height / 2);

    gsap.to(img, {
      zIndex: 1000,
      scale,
      x,
      y,
      duration: 0.6,
      ease: "power3.out"
    });
  };
  

  return (
    <div ref={containerRef} className="slider-container">
      <div ref={trackRef} className="image-track">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`Slide ${i + 1}`}
            className="slide-image"
            onClick={(e) => expandImage(e.currentTarget)}
          />
        ))}
      </div>
    </div>
  );
}
