/**
 * Uni4D Project - Main JavaScript
 * 
 * Handles all gallery functionality and interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all galleries
    initGalleries();
    
    // Add window resize handler to adjust layout
    window.addEventListener('resize', throttle(handleResize, 100));
    
    // Initial resize handling
    handleResize();
    
    // Setup lazy loading for videos using Intersection Observer
    setupLazyVideoLoading();
});

/**
 * Throttle function to limit how often a function can be called
 * @param {Function} func - The function to throttle
 * @param {number} limit - The time limit in milliseconds
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Handle window resizing to maintain proper layout
 */
function handleResize() {
    // Adjust video container positions
    adjustVideoContainerPositions();
}

/**
 * Setup lazy loading for videos using Intersection Observer
 */
function setupLazyVideoLoading() {
    if (!('IntersectionObserver' in window)) return;

    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            
            if (entry.isIntersecting) {
                // Only load video if it's in an active slide
                if (video.closest('.active')) {
                    if (video.dataset.src && !video.src) {
                        video.src = video.dataset.src;
                    }
                    
                    // Make sure video plays if it's visible and in active slide
                    if (video.readyState >= 2) {
                        video.play().catch(() => {});
                    }
                }
            } else {
                // Pause video when not visible
                if (!video.paused) {
                    video.pause();
                }
            }
        });
    }, {
        rootMargin: '200px',
        threshold: 0.1
    });
    
    // Observe all videos
    document.querySelectorAll('video').forEach(video => {
        videoObserver.observe(video);
    });
}

/**
 * Adjust the positions of video containers within gallery slides
 */
function adjustVideoContainerPositions() {
    // Only position videos for visible slides to reduce layout work
    const activeSlides = document.querySelectorAll('.gallery-slide.active, .comp-slide.active');
    
    activeSlides.forEach(slide => {
        const videoContainer = slide.querySelector('.video-container');
        const iframeContainer = slide.querySelector('.iframe-container');
        
        if (videoContainer && iframeContainer) {
            // Move video container inside iframe container
            if (videoContainer.parentElement !== iframeContainer) {
                iframeContainer.appendChild(videoContainer);
            }
            
            // Ensure the video container is properly positioned
            videoContainer.style.position = 'absolute';
            videoContainer.style.zIndex = '20';
        }
    });
}

/**
 * Initialize all galleries with a unified approach
 */
function initGalleries() {
    // Initialize main gallery
    initGallery('.gallery-slide:not(.comp-slide):not(.pose-slide)', 
               '.gallery-nav.prev:not(.comp-prev):not(.pose-prev)', 
               '.gallery-nav.next:not(.comp-next):not(.pose-next)', 
               '.gallery-indicator:not(.comp-indicator):not(.pose-indicator)');
    
    // Initialize comparison gallery
    initGallery('.comp-slide', 
               '.gallery-nav.comp-prev', 
               '.gallery-nav.comp-next', 
               '.gallery-indicator.comp-indicator', 
               '.dataset-btn:not(.pose-dataset-btn)');
    
    // Initialize pose gallery
    initGallery('.pose-slide', 
               '.gallery-nav.pose-prev', 
               '.gallery-nav.pose-next', 
               '.gallery-indicator.pose-indicator',
               '.dataset-btn.pose-dataset-btn');
}

/**
 * Unified gallery initialization function
 * @param {string} slideSelector - CSS selector for the slides
 * @param {string} prevBtnSelector - CSS selector for the previous button
 * @param {string} nextBtnSelector - CSS selector for the next button
 * @param {string} indicatorSelector - CSS selector for the indicators
 * @param {string} datasetBtnSelector - Optional CSS selector for dataset buttons
 */
function initGallery(slideSelector, prevBtnSelector, nextBtnSelector, indicatorSelector, datasetBtnSelector = null) {
    const slides = document.querySelectorAll(slideSelector);
    const prevBtn = document.querySelector(prevBtnSelector);
    const nextBtn = document.querySelector(nextBtnSelector);
    const indicators = document.querySelectorAll(indicatorSelector);
    const datasetBtns = datasetBtnSelector ? document.querySelectorAll(datasetBtnSelector) : [];
    
    // Exit if required elements don't exist
    if (!slides.length) {
        return;
    }
    
    let currentIndex = 0;
    
    /**
     * Update the slide display to show the slide at the specified index
     */
    function updateSlide(index) {
        // Update current index first to prevent race conditions
        currentIndex = index;
        
        // Update slide visibility
        slides.forEach((slide, i) => {
            if (i === index) {
                slide.classList.add('active');
                slide.style.position = 'relative';
                slide.style.visibility = 'visible';
                slide.style.display = 'block';
                slide.style.opacity = '1';
            } else {
                slide.classList.remove('active');
                slide.style.position = 'absolute';
                slide.style.visibility = 'hidden';
                slide.style.display = 'none';
                slide.style.opacity = '0';
            }
        });
        
        // Update indicators
        indicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
        
        // Update dataset buttons if applicable
        if (datasetBtns.length) {
            datasetBtns.forEach((btn, i) => {
                btn.classList.toggle('active', i === index);
            });
        }
        
        // Reposition video containers for the active slide
        setTimeout(adjustVideoContainerPositions, 10);
        
        // Start loading videos for this slide if they have data-src
        const activeSlideVideos = slides[index].querySelectorAll('video[data-src]');
        activeSlideVideos.forEach(video => {
            if (!video.src) {
                video.src = video.dataset.src;
            }
        });
    }
    
    // Add event listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            updateSlide((currentIndex - 1 + slides.length) % slides.length);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', e => {
            e.preventDefault();
            e.stopPropagation();
            updateSlide((currentIndex + 1) % slides.length);
        });
    }
    
    // Add event listeners for indicator dots
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => updateSlide(index));
    });
    
    // Add event listeners for dataset buttons if applicable
    datasetBtns.forEach((button, index) => {
        button.addEventListener('click', () => updateSlide(index));
    });
    
    // Initialize the first slide
    updateSlide(0);
}

/**
 * Helper function to play a video with error handling
 */
function playVideo(video) {
    if (!video || !video.paused || video.readyState < 2) return;
    
    video.play().catch(() => {
        // Silently fail - we'll retry when in view
    });
}

// Remove all other functions that are not used anymore to reduce JavaScript processing