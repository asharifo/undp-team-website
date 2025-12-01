import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import FullscreenOverlay from "./FullscreenOverlay";

gsap.registerPlugin(Draggable, InertiaPlugin);

export default function ImageSlider({ images }) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const slideRefs = useRef([]);
  const draggableInstance = useRef(null);
  const parallaxSetters = useRef([]);
  const imageLoadedRef = useRef(new Set());

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Preload and optimize images
  const preloadImages = useCallback(() => {
    let loadedCount = 0;
    const totalImages = images.length;

    images.forEach((src, index) => {
      const img = new Image();
      img.onload = () => {
        imageLoadedRef.current.add(index);
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesLoaded(true);
        }
      };
      img.onerror = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesLoaded(true);
        }
      };
      // Add loading hints for better performance
      img.decoding = "async";
      img.loading = "eager";
      img.src = src;
    });
  }, [images]);

  // Preload images on mount
  useEffect(() => {
    preloadImages();
  }, [preloadImages]);

  // Optimized animation loop with visibility culling
  useEffect(() => {
    if (!imagesLoaded) return;

    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const maxDrag = track.scrollWidth - container.offsetWidth;
    const buffer = window.innerWidth * 0.5;
    const PARALLAX_RATIO = 0.3;
    const SCROLL_SENSITIVITY = 1.2;
    const LERP_FACTOR = 0.12; // Slightly higher for more responsiveness

    // Setup optimized parallax with visibility culling
    const slides = slideRefs.current.filter(Boolean);
    const images = slides.map((slide) => slide?.querySelector("img")).filter(Boolean);
    
    // Force hardware acceleration and optimize rendering
    images.forEach((img, i) => {
      gsap.set(img, { 
        force3D: true,
        willChange: "transform",
        backfaceVisibility: "hidden",
        perspective: 1000
      });
      // Set loading attributes for better performance
      img.style.imageRendering = "optimizeSpeed";
      img.style.imageRendering = "-webkit-optimize-contrast";
    });

    parallaxSetters.current = images.map((img) => gsap.quickSetter(img, "x", "px"));

    // Smooth interpolation variables
    let currentPosition = 0;
    let targetPosition = 0;
    let rafId = null;
    let isAnimating = false;

    // Visibility culling for better performance
    function updateParallax(trackX) {
      const containerRect = container.getBoundingClientRect();
      const shift = -trackX * PARALLAX_RATIO;
      
      slides.forEach((slide, i) => {
        if (!slide) return;
        
        const slideRect = slide.getBoundingClientRect();
        const isVisible = slideRect.right > -200 && slideRect.left < window.innerWidth + 200;
        
        if (isVisible && parallaxSetters.current[i]) {
          parallaxSetters.current[i](shift);
        }
      });
    }

    // Optimized animation loop with better frame pacing
    function animate() {
      const delta = targetPosition - currentPosition;
      
      if (Math.abs(delta) > 0.5) {
        currentPosition += delta * LERP_FACTOR;
        
        // Use transform3d for hardware acceleration
        gsap.set(track, { 
          x: currentPosition,
          force3D: true
        });
        updateParallax(currentPosition);
        rafId = requestAnimationFrame(animate);
      } else {
        // Snap to final position
        gsap.set(track, { 
          x: targetPosition,
          force3D: true
        });
        updateParallax(targetPosition);
        currentPosition = targetPosition;
        isAnimating = false;
        rafId = null;
      }
    }

    // Optimized draggable instance
    const instance = Draggable.create(track, {
      type: "x",
      bounds: { minX: -maxDrag - buffer, maxX: buffer },
      inertia: true,
      dragResistance: 0.15,
      throwResistance: 1200,
      cursor: "grab",
      onPress() {
        this.cursor = "grabbing";
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
          isAnimating = false;
        }
      },
      onRelease() {
        this.cursor = "grab";
      },
      onDrag() {
        currentPosition = this.x;
        targetPosition = this.x;
        updateParallax(this.x);
      },
      onThrowUpdate() {
        currentPosition = this.x;
        targetPosition = this.x;
        updateParallax(this.x);
      },
    })[0];

    currentPosition = instance.x;
    targetPosition = instance.x;
    updateParallax(instance.x);
    draggableInstance.current = instance;

    // Throttled wheel handler for better performance
    let wheelTimeout = null;
    const handleWheel = (e) => {
      if (isFullscreen) return;
      
      e.preventDefault();
      
      if (wheelTimeout) {
        clearTimeout(wheelTimeout);
      }
      
      const scrollDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      const deltaX = scrollDelta * SCROLL_SENSITIVITY;
      
      targetPosition = Math.max(
        -maxDrag - buffer,
        Math.min(buffer, targetPosition - deltaX)
      );
      
      if (!isAnimating) {
        isAnimating = true;
        rafId = requestAnimationFrame(animate);
      }
      
      // Debounce for better performance
      wheelTimeout = setTimeout(() => {
        wheelTimeout = null;
      }, 16);
    };

    // Handle fullscreen state changes
    const handleFullscreenChange = () => {
      if (isFullscreen) {
        instance.disable();
        container.style.pointerEvents = "none";
        track.style.pointerEvents = "none";
        container.removeEventListener("wheel", handleWheel);
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
          isAnimating = false;
        }
      } else {
        instance.enable();
        container.style.pointerEvents = "auto";
        track.style.pointerEvents = "auto";
        container.addEventListener("wheel", handleWheel, { passive: false });
      }
    };

    handleFullscreenChange();

    return () => {
      instance.kill();
      container.removeEventListener("wheel", handleWheel);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      if (wheelTimeout) {
        clearTimeout(wheelTimeout);
      }
    };
  }, [isFullscreen, imagesLoaded]);

  const handleThumbnailClick = (index) => {
    setCurrentIndex(index);
    setIsFullscreen(true);
  };

  const handleFullscreenExit = () => {
    setIsFullscreen(false);
  };

  const handleIndexChange = (newIndex) => {
    setCurrentIndex(newIndex);
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
        <FullscreenOverlay
          images={images}
          currentIndex={currentIndex}
          slideRefs={slideRefs}
          onExit={handleFullscreenExit}
          onIndexChange={handleIndexChange}
        />
      )}
    </>
  );
}