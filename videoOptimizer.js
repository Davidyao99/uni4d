/**
 * Video Optimizer
 * 
 * This script handles video optimization:
 * - Converts data-src to src when videos enter viewport
 * - Ensures videos only play when visible
 * - Reduces memory usage by unloading videos not in viewport
 */

document.addEventListener('DOMContentLoaded', function() {
    // Convert all video src attributes to data-src for lazy loading
    prepareVideosForLazyLoading();
    
    // Set up intersection observer for videos
    setupVideoIntersectionObserver();
});

/**
 * Prepare videos for lazy loading by moving src to data-src
 */
function prepareVideosForLazyLoading() {
    const videos = document.querySelectorAll('video');
    
    videos.forEach(video => {
        // Skip videos that already have data-src or are in the first slide
        if (video.hasAttribute('data-src') || video.closest('.gallery-slide.active')) {
            return;
        }
        
        // Store original source in data attribute
        const sources = video.querySelectorAll('source');
        sources.forEach(source => {
            if (source.src) {
                source.dataset.src = source.src;
                source.removeAttribute('src');
            }
        });
        
        // Add loading="lazy" attribute for native lazy loading support
        if (!video.hasAttribute('loading')) {
            video.setAttribute('loading', 'lazy');
        }
        
        // Set preload to none for reduced network usage
        if (!video.hasAttribute('preload')) {
            video.setAttribute('preload', 'none');
        }
    });
}

/**
 * Set up intersection observer for videos
 */
function setupVideoIntersectionObserver() {
    // Exit if browser doesn't support Intersection Observer
    if (!('IntersectionObserver' in window)) return;
    
    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;
            
            if (entry.isIntersecting) {
                // Video is in viewport, load and play it
                loadAndPlayVideo(video);
            } else {
                // Video is out of viewport, pause it to save resources
                if (!video.paused) {
                    video.pause();
                }
            }
        });
    }, {
        rootMargin: '100px',
        threshold: 0.1
    });
    
    // Observe all videos
    document.querySelectorAll('video').forEach(video => {
        videoObserver.observe(video);
    });
}

/**
 * Load and play a video when it's in the viewport
 */
function loadAndPlayVideo(video) {
    // If video is in an active slide
    if (video.closest('.active')) {
        // Load sources if they exist as data attributes
        const sources = video.querySelectorAll('source[data-src]');
        let sourceChanged = false;
        
        sources.forEach(source => {
            if (source.dataset.src && !source.src) {
                source.src = source.dataset.src;
                sourceChanged = true;
            }
        });
        
        // If source was changed, load the video
        if (sourceChanged) {
            video.load();
        }
        
        // Play the video if it's paused
        if (video.paused) {
            // Set muted again to ensure autoplay works
            video.muted = true;
            
            // Try to play when ready
            if (video.readyState >= 2) {
                video.play().catch(() => {
                    // If autoplay is blocked, just continue silently
                });
            } else {
                // Wait for video to be ready
                video.addEventListener('loadeddata', function playWhenReady() {
                    video.play().catch(() => {});
                    video.removeEventListener('loadeddata', playWhenReady);
                });
            }
        }
    }
}
