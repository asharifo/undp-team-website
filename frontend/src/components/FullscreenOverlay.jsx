import { useRef, useLayoutEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function FullscreenOverlay({
    images,
    currentIndex,
    slideRefs,
    onExit,
    onIndexChange
}) {
    const fullscreenRef = useRef(null);
    const sectionsContainerRef = useRef(null);
    const [scrollAccumulator, setScrollAccumulator] = useState(0);
    const scrollTimeoutRef = useRef(null);

    // Progress indicator component
    const ProgressIndicator = () => (
        <div className="progress-indicator">
            {images.map((_, index) => (
                <button
                    key={index}
                    className={`progress-dot ${index === currentIndex ? 'active' : ''}`}
                    onClick={() => navigateToSection(index)}
                    aria-label={`Go to image ${index + 1}`}
                >
                    <span className="sr-only">Image {index + 1}</span>
                </button>
            ))}
        </div>
    );

    // Improved scroll handler with better trackpad support
    const handleWheel = useCallback((e) => {
        e.preventDefault();

        // Clear existing timeout
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        // Accumulate scroll delta for better trackpad detection
        const scrollDelta = e.deltaY;
        const newAccumulator = scrollAccumulator + scrollDelta;
        setScrollAccumulator(newAccumulator);

        // Set threshold for exit (adjust as needed)
        const EXIT_THRESHOLD = 20;

        // Only exit if we have significant upward scroll accumulation
        if (newAccumulator < -EXIT_THRESHOLD) {
            handleExit();
            return;
        }

        // Reset accumulator after a delay
        scrollTimeoutRef.current = setTimeout(() => {
            setScrollAccumulator(0);
        }, 200);
    }, [scrollAccumulator]);

    // Handle entrance and exit animations
    useLayoutEffect(() => {
        const timeline = gsap.timeline();

        // Animate thumbnails sliding up
        slideRefs.current.forEach((slide, i) => {
            if (slide) {
                timeline.to(
                    slide,
                    { y: "-100vh", duration: 0.2, ease: "power3.in" },
                    i * 0.05
                );
            }
        });

        // Animate fullscreen overlay rising
        timeline.to(
            fullscreenRef.current,
            { y: 0, duration: 0.6, ease: "power3.in" },
            0.1
        );

        // Set initial position of sections container
        gsap.set(sectionsContainerRef.current, { xPercent: -currentIndex * 100 });

        // Add improved wheel listener
        window.addEventListener("wheel", handleWheel, { passive: false });

        // Handle keyboard navigation
        const handleKeyDown = (e) => {
            switch (e.key) {
                case 'Escape':
                    handleExit();
                    break;
                case 'ArrowLeft':
                    handlePrevious();
                    break;
                case 'ArrowRight':
                    handleNext();
                    break;
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("wheel", handleWheel);
            window.removeEventListener("keydown", handleKeyDown);
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
            timeline.kill();
        };
    }, [handleWheel]); // Include handleWheel in dependencies

    // Handle section navigation
    const navigateToSection = (newIndex) => {
        if (
            newIndex < 0 ||
            newIndex >= images.length ||
            newIndex === currentIndex ||
            !sectionsContainerRef.current
        ) return;

        gsap.to(sectionsContainerRef.current, {
            xPercent: -newIndex * 100,
            duration: 0.5,
            ease: "power3.inOut",
            onComplete: () => {
                onIndexChange(newIndex);
            },
        });
    };

    const handlePrevious = () => {
        const newIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
        navigateToSection(newIndex);
    };

    const handleNext = () => {
        const newIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
        navigateToSection(newIndex);
    };

    const handleExit = () => {
        const timeline = gsap.timeline({
            onComplete: onExit,
        });

        // Drop the overlay
        timeline.to(fullscreenRef.current, {
            y: "100%",
            duration: 0.6,
            ease: "power3.in"
        });

        // Slide thumbnails back down
        slideRefs.current.forEach((slide, idx) => {
            if (slide) {
                timeline.to(
                    slide,
                    { y: "0", duration: 0.2, ease: "power3.in" },
                    `-=${0.4 - idx * 0.05}`
                );
            }
        });
    };

    return (
        <div ref={fullscreenRef} className="fullscreen-overlay">
            <div className="fullscreen-content">
                <button className="nav-button nav-previous" onClick={handlePrevious}>
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
                <ProgressIndicator />
            </div>
        </div>
    );
}