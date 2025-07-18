import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

gsap.registerPlugin(Draggable, InertiaPlugin);

export default function ImageSlider({ images }) {
  // refs
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const slideRefs = useRef([]);
  const fullscreenRef = useRef(null);
  const sectionsContainerRef = useRef(null);
  const draggableInstance = useRef(null);

  // state
  const [isFullscreen, setFullscreen] = useState(false);
  const [currIndex, setCurrIndex] = useState(0);

  // Carousel drag and parallax effect
  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const maxDrag = track.scrollWidth - container.offsetWidth;
    const buffer = window.innerWidth * 0.5;

    const images = slideRefs.current
      .map((slide) => slide?.querySelector("img"))
      .filter(Boolean);
    const setters = images.map((img) => gsap.quickSetter(img, "x", "px"));
    const PARALLAX_RATIO = 0.2;

    function updateParallax(draggable) {
      const trackX = draggable.x; 
      const shift = -trackX * PARALLAX_RATIO;
      for (let i = 0; i < setters.length; i++) setters[i](shift);
    }

    const instance = Draggable.create(track, {
      type: "x",
      bounds: { minX: -maxDrag - buffer, maxX: buffer },
      inertia: true,
      dragResistance: 0.3,
      throwResistance: 2000,
      cursor: "grab",
      onPress() {
        this.cursor = "grabbing";
      },
      onRelease() {
        this.cursor = "grab";
      },
      onDrag() { updateParallax(this); },
      onThrowUpdate() { updateParallax(this); }
    })[0];

    updateParallax(instance);
    draggableInstance.current = instance;
    return () => instance.kill();
  }, []);

  // Disable draggable and scroll down to transition back
  useEffect(() => {
    // Disable the draggable instance if in fullscreen mode
    const inst = draggableInstance.current;
    if (isFullscreen) {
      inst?.disable();
      // Scroll down to animate transition back to image-track
      const onWheel = (e) => {
        if (e.deltaY > 0) exitFullscreen();
      };
      window.addEventListener("wheel", onWheel);
      return () => window.removeEventListener("wheel", onWheel);
    } else {
      inst?.enable();
    }
  }, [isFullscreen]);

  // Thumbnail click to fullscreen mode
  const handleThumbnailClick = (i) => {
    setCurrIndex(i);
    enterFullscreen();
  };

  useLayoutEffect(() => {
    const track = trackRef.current;
    const container = containerRef.current;
    const tl = gsap.timeline();

    if (isFullscreen) {
      container.style.pointerEvents = "none";
      track.style.pointerEvents = "none";
      gsap.set(sectionsContainerRef.current, { xPercent: -currIndex * 100 });

      slideRefs.current.forEach((slide, i) => {
        if (slide) {
          tl.to(
            slide,
            { y: "-100vh", duration: 0.2, ease: "power3.in" },
            i * 0.05
          );
        }
      });
      gsap.to(fullscreenRef.current, {
        y: 0,
        delay: 0.1,
        duration: 0.6,
        ease: "power3.in",
      });
    } else {
      container.style.pointerEvents = "auto";
      track.style.pointerEvents = "auto";
    }
    return () => tl.kill();
  }, [isFullscreen]);

  // Enter fullscreen with staggered image slide‑up and fullscreen overlay rise
  const enterFullscreen = () => {
    setFullscreen(true);
  };

  // Exit fullscreen with overlay drop + slide‑down reset
  const exitFullscreen = () => {
    const tl = gsap.timeline({
      onComplete: () => {
        setFullscreen(false);
      },
    });

    // Drop the overlay
    const fsEl = fullscreenRef.current;
    if (fsEl) {
      tl.to(fsEl, { y: "100%", duration: 0.6, ease: "power3.in" });
    }

    // Slide thumbnails back down
    slideRefs.current.forEach((slide, idx) => {
      if (slide) {
        tl.to(
          slide,
          { y: "0", duration: 0.2, ease: "power3.in" },
          `-=${0.4 - idx * 0.05}`
        );
      }
    });
  };

  // Navigate between fullscreen sections
  const navigateToSection = (newIndex) => {
    if (
      newIndex < 0 ||
      newIndex >= images.length ||
      newIndex === currIndex ||
      !sectionsContainerRef.current
    )
      return;
    gsap.to(sectionsContainerRef.current, {
      xPercent: -newIndex * 100,
      duration: 0.5,
      ease: "power3.inOut",
      onComplete: () => {
        setCurrIndex(newIndex);
      },
    });
  };

  const handlePrevious = () => {
    const newIndex = currIndex > 0 ? currIndex - 1 : images.length - 1;
    navigateToSection(newIndex);
  };

  const handleNext = () => {
    const newIndex = currIndex < images.length - 1 ? currIndex + 1 : 0;
    navigateToSection(newIndex);
  };

  return (
    <>
      {/* Thumbnail carousel */}
      <div ref={containerRef} className="slider-container">
        <div ref={trackRef} className="image-track">
          {images.map((src, i) => (
            <div
              key={i}
              className="slide"
              ref={(el) => (slideRefs.current[i] = el)}
              onClick={() => handleThumbnailClick(i)}
            >
              <img src={src} alt={`Slide ${i + 1}`} />
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div ref={fullscreenRef} className="fullscreen-overlay">
          <div className="fullscreen-content">
            <button className="close-button" onClick={exitFullscreen}>
              <X />
            </button>

            <button
              className="nav-button nav-previous"
              onClick={handlePrevious}
            >
              <ChevronLeft />
            </button>

            <div ref={sectionsContainerRef} className="sections-container">
              {images.map((src, idx) => (
                <div key={idx} className="fullscreen-section">
                  <div className="section-content">
                    <img
                      src={src}
                      alt={`Section ${idx + 1}`}
                      className="section-image"
                    />
                    <div className="section-info">
                      <h2 className="section-title">Section {idx + 1}</h2>
                      <p className="section-description">
                        This is the content for section {idx + 1}. You can add
                        any content here—text, videos, etc.
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className="nav-button nav-next" onClick={handleNext}>
              <ChevronRight />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
