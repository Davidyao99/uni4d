/**
 * Uni4D Project - Main JavaScript
 * 
 * Handles all gallery functionality and interactions
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the main gallery
    initMainGallery();
    
    // Initialize comparison gallery
    initComparisonGallery();
    
    // Initialize pose gallery
    initPoseGallery();

    // Add window resize handler to adjust layout
    window.addEventListener('resize', handleResize);
    
    // Initial resize handling
    handleResize();
    
    // Remove the duplicate navigation event handlers for comparison gallery
    // The navigation button handlers are now managed by initComparisonGallery()
});

/**
 * Handle window resizing to maintain proper layout
 */
function handleResize() {
    // Adjust video containers when window size changes
    adjustVideoContainers();
    
    // Position video containers properly
    adjustVideoContainerPositions();
    
    // Make sure active slides are properly displayed
    const activeSlides = document.querySelectorAll('.gallery-slide.active, .comp-slide.active');
    activeSlides.forEach(slide => {
        // Ensure active slides maintain proper display
        slide.style.position = 'relative';
        slide.style.visibility = 'visible';
        slide.style.opacity = '1';
    });
}

/**
 * Adjust video containers to match their content
 */
function adjustVideoContainers() {
    const videos = document.querySelectorAll('.gallery-video, .comparison-video');
    videos.forEach(video => {
        // Make sure the video is visible
        video.style.display = 'block';
        video.style.width = '100%';
        video.style.height = 'auto';
        
        // Handle video metadata loading
        if (video.readyState >= 1) {
            video.parentElement.style.height = 'auto';
        } else {
            video.addEventListener('loadedmetadata', function() {
                video.parentElement.style.height = 'auto';
            });
        }
    });
}

/**
 * Adjust the positions of video containers within gallery slides
 * to ensure they maintain proper position when window resizes
 */
function adjustVideoContainerPositions() {
    const activeSlide = document.querySelector('.gallery-slide.active');
    if (!activeSlide) return;
    
    const videoContainer = activeSlide.querySelector('.video-container');
    const iframeContainer = activeSlide.querySelector('.iframe-container');
    
    if (!videoContainer || !iframeContainer) return;
    
    // Move video container inside iframe container
    iframeContainer.appendChild(videoContainer);
    
    // Ensure the video container is properly positioned
    videoContainer.style.position = 'absolute';
    videoContainer.style.zIndex = '20';
}

/**
 * Initialize the main interactive results gallery with simplified code
 */
function initMainGallery() {
    const slides = document.querySelectorAll('.gallery-slide:not(.comp-slide)');
    const prevBtn = document.querySelector('.gallery-nav.prev:not(.comp-prev):not(.pose-prev)');
    const nextBtn = document.querySelector('.gallery-nav.next:not(.comp-next):not(.pose-next)');
    const indicators = document.querySelectorAll('.gallery-indicator:not(.comp-indicator):not(.pose-indicator)');
    
    // Exit if required elements don't exist
    if (!slides.length || !prevBtn || !nextBtn || !indicators.length) {
        console.warn('Main gallery initialization failed: Missing required elements');
        return;
    }
    
    let currentSlideIndex = 0;
    
    // Force videos to play on page load
    forcePlayVideos();
    
    /**
     * Update the slide display to show the slide at the specified index
     */
    function updateSlide(index) {
        // Hide all slides and show only the current one
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
            
            // Position active slide properly for responsive layout
            if (i === index) {
                slide.style.position = 'relative';
                slide.style.visibility = 'visible';
                slide.style.opacity = '1';
                
                // Move video container inside iframe container
                const videoContainer = slide.querySelector('.video-container');
                const iframeContainer = slide.querySelector('.iframe-container');
                
                if (videoContainer && iframeContainer) {
                    iframeContainer.appendChild(videoContainer);
                }
            } else {
                slide.style.position = 'absolute';
                slide.style.visibility = 'hidden';
                slide.style.opacity = '0';
            }
            
            // Handle videos - play current slide videos, pause others
            const videos = slide.querySelectorAll('video');
            videos.forEach(video => {
                if (i === index) {
                    // Ensure video attributes are set correctly
                    video.loop = true;
                    video.muted = true;
                    video.playsInline = true;
                    
                    // For first gallery slide, remove any overlay and force play
                    if (i === 0) {
                        const existingOverlay = video.parentElement.querySelector('.video-play-overlay');
                        if (existingOverlay) {
                            existingOverlay.remove();
                        }
                        video.play().catch(e => console.log('First video play error:', e));
                    } else {
                        playVideo(video);
                    }
                } else if (video && !video.paused) {
                    video.pause();
                }
            });
        });
        
        // Update indicators
        indicators.forEach((indicator, i) => indicator.classList.toggle('active', i === index));
        
        // Update current index
        currentSlideIndex = index;
        
        // Adjust container heights and positions after slide change
        setTimeout(() => {
            adjustVideoContainers();
            adjustVideoContainerPositions();
        }, 50);
    }
    
    // Add event listeners with event prevention
    nextBtn.addEventListener('click', e => {
        e.stopPropagation();
        updateSlide((currentSlideIndex + 1) % slides.length);
    });
    
    prevBtn.addEventListener('click', e => {
        e.stopPropagation();
        updateSlide((currentSlideIndex - 1 + slides.length) % slides.length);
    });
    
    // Add event listeners for indicator dots
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => updateSlide(index));
    });
    
    // Initialize the first slide
    updateSlide(0);
}

/**
 * Initialize the comparison gallery - simplified implementation with improved button handling
 */
function initComparisonGallery() {
    const compSlides = document.querySelectorAll('.comp-slide');
    const compPrevBtn = document.querySelector('.gallery-nav.comp-prev');
    const compNextBtn = document.querySelector('.gallery-nav.comp-next');
    const compIndicators = document.querySelectorAll('.gallery-indicator.comp-indicator');
    const datasetButtons = document.querySelectorAll('.dataset-btn:not(.pose-dataset-btn)');
    
    // Exit if required elements don't exist
    if (!compSlides.length) {
        console.warn('Comparison gallery initialization failed: Missing required elements');
        return;
    }
    
    let currentCompSlideIndex = 0;
    
    /**
     * Update the comparison slide display
     * @param {number} index - The index of the slide to display
     */
    function updateCompSlide(index) {
        console.log('Updating comp slide to index:', index); // Debugging log

        // Hide all slides and show only the selected one
        compSlides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
            
            // Handle visibility for better performance
            if (i === index) {
                slide.style.position = 'relative';
                slide.style.visibility = 'visible';
                slide.style.opacity = '1';
            } else {
                slide.style.position = 'absolute';
                slide.style.visibility = 'hidden';
                slide.style.opacity = '0';
            }
        });
        
        // Update indicator states
        compIndicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
        
        // Update dataset button states
        const datasets = ['sintel', 'tum', 'bonn', 'kitti', 'davis'];
        datasetButtons.forEach(btn => {
            const btnDataset = btn.dataset.dataset?.toLowerCase();
            btn.classList.toggle('active', btnDataset === datasets[index]);
        });
        
        // Update current index
        currentCompSlideIndex = index;
        
        // Play videos in the active slide, pause others
        compSlides.forEach((slide, i) => {
            const videos = slide.querySelectorAll('video');
            videos.forEach(video => {
                if (i === index) {
                    video.currentTime = 0; // Reset to beginning
                    playVideo(video);
                } else if (video && !video.paused) {
                    video.pause();
                }
            });
        });
        
        // Ensure navigation buttons are properly visible and working
        if (compPrevBtn && compNextBtn) {
            compPrevBtn.style.display = 'flex';
            compPrevBtn.style.zIndex = '30';
            compNextBtn.style.display = 'flex';
            compNextBtn.style.zIndex = '30';
        }
    }
    
    /**
     * Navigate to next comparison slide with wraparound
     */
    function nextCompSlide(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        let newIndex = currentCompSlideIndex + 1;
        if (newIndex >= compSlides.length) {
            newIndex = 0;
        }
        console.log('Next comp slide - new index:', newIndex); // Debugging log
        updateCompSlide(newIndex);
    }
    
    /**
     * Navigate to previous comparison slide with wraparound
     */
    function prevCompSlide(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        let newIndex = currentCompSlideIndex - 1;
        if (newIndex < 0) {
            newIndex = compSlides.length - 1;
        }
        console.log('Previous comp slide - new index:', newIndex); // Debugging log
        updateCompSlide(newIndex);
    }
    
    // First, remove any existing event listeners from the navigation buttons
    // This is crucial to prevent duplicate event handlers
    if (compPrevBtn) {
        const newPrevBtn = compPrevBtn.cloneNode(true);
        compPrevBtn.parentNode.replaceChild(newPrevBtn, compPrevBtn);
        newPrevBtn.addEventListener('click', prevCompSlide);
    }
    
    if (compNextBtn) {
        const newNextBtn = compNextBtn.cloneNode(true);
        compNextBtn.parentNode.replaceChild(newNextBtn, compNextBtn);
        newNextBtn.addEventListener('click', nextCompSlide);
    }
    
    // Add click handlers for indicators
    compIndicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => updateCompSlide(index));
    });
    
    // Add click handlers for dataset buttons
    datasetButtons.forEach(button => {
        button.addEventListener('click', function() {
            const dataset = this.dataset.dataset?.toLowerCase();
            if (!dataset) return;
            
            const datasets = ['sintel', 'tum', 'bonn', 'kitti', 'davis'];
            const index = datasets.indexOf(dataset);
            if (index !== -1) {
                updateCompSlide(index);
            }
        });
    });
    
    // Initialize the first comparison slide
    updateCompSlide(0);
    
    // Make sure navigation buttons remain accessible
    window.addEventListener('resize', function() {
        if (compPrevBtn && compNextBtn) {
            compPrevBtn.style.display = 'flex';
            compPrevBtn.style.zIndex = '30';
            compNextBtn.style.display = 'flex';
            compNextBtn.style.zIndex = '30';
        }
    });
    
    // Make these functions available to other parts of the code
    window.comparisonGalleryNavigation = {
        updateCompSlide,
        nextCompSlide,
        prevCompSlide
    };
}

/**
 * Initialize the pose evaluation gallery
 */
function initPoseGallery() {
    const poseSlides = document.querySelectorAll('.pose-slide');
    const posePrevBtn = document.querySelector('.gallery-nav.pose-prev');
    const poseNextBtn = document.querySelector('.gallery-nav.pose-next');
    const poseIndicators = document.querySelectorAll('.gallery-indicator.pose-indicator');
    const poseButtons = document.querySelectorAll('.dataset-btn.pose-dataset-btn');
    
    // Exit if required elements don't exist
    if (!poseSlides.length) {
        console.warn('Pose gallery initialization failed: Missing required elements');
        return;
    }
    
    let currentPoseSlideIndex = 0;
    
    /**
     * Update the pose slide display
     * @param {number} index - The index of the slide to display
     */
    function updatePoseSlide(index) {
        // Hide all slides and show only the selected one
        poseSlides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
            
            if (i === index) {
                slide.style.display = 'block';
            } else {
                slide.style.display = 'none';
            }
        });
        
        // Update indicator states
        poseIndicators.forEach((indicator, i) => {
            indicator.classList.toggle('active', i === index);
        });
        
        // Update button states
        poseButtons.forEach((button, i) => {
            button.classList.toggle('active', i === index);
        });
        
        // Update current index
        currentPoseSlideIndex = index;
        
        // Ensure navigation buttons are displayed properly
        if (posePrevBtn && poseNextBtn) {
            posePrevBtn.style.display = 'flex';
            posePrevBtn.style.zIndex = '30';
            poseNextBtn.style.display = 'flex';
            poseNextBtn.style.zIndex = '30';
        }
    }
    
    /**
     * Navigate to next pose slide with wraparound
     */
    function nextPoseSlide(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        let newIndex = currentPoseSlideIndex + 1;
        if (newIndex >= poseSlides.length) {
            newIndex = 0;
        }
        updatePoseSlide(newIndex);
    }
    
    /**
     * Navigate to previous pose slide with wraparound
     */
    function prevPoseSlide(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        let newIndex = currentPoseSlideIndex - 1;
        if (newIndex < 0) {
            newIndex = poseSlides.length - 1;
        }
        updatePoseSlide(newIndex);
    }
    
    // Add direct event listeners for pose navigation buttons
    if (posePrevBtn) {
        posePrevBtn.addEventListener('click', prevPoseSlide);
    }
    
    if (poseNextBtn) {
        poseNextBtn.addEventListener('click', nextPoseSlide);
    }
    
    // Add click handlers for pose indicator dots
    poseIndicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => updatePoseSlide(index));
    });
    
    // Add click handlers for pose dataset buttons
    poseButtons.forEach((button, index) => {
        button.addEventListener('click', function() {
            updatePoseSlide(index);
        });
    });
    
    // Initialize first slide
    updatePoseSlide(0);
    
    // Make sure navigation buttons remain accessible
    window.addEventListener('resize', function() {
        if (posePrevBtn && poseNextBtn) {
            posePrevBtn.style.display = 'flex';
            posePrevBtn.style.zIndex = '30';
            poseNextBtn.style.display = 'flex';
            poseNextBtn.style.zIndex = '30';
        }
    });
    
    // Make these functions available to other parts of the code
    window.poseGalleryNavigation = {
        updatePoseSlide,
        nextPoseSlide,
        prevPoseSlide
    };
}

/**
 * Helper function to play a video with error handling - clean up implementation
 */
function playVideo(video) {
    if (!video || !video.paused) return;
    
    video.play().catch(error => {
        console.log('Video autoplay prevented:', error);
        
        // Skip adding play overlay for Sintel dataset videos or for first gallery slide
        const isInSintelSlide = video.closest('.comp-slide') && 
                               video.closest('.comp-slide') === document.querySelector('.comp-slide:first-child');
        
        const isInFirstGallerySlide = video.closest('.gallery-slide') && 
                                     video.closest('.gallery-slide') === document.querySelector('.gallery-slide:first-child');
        
        if (isInSintelSlide || isInFirstGallerySlide || video.parentElement.querySelector('.video-play-overlay')) return;
        
        // Add playback overlay for non-first gallery slides
        const overlay = document.createElement('div');
        overlay.className = 'video-play-overlay';
        overlay.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
        overlay.addEventListener('click', () => {
            video.play()
                .then(() => overlay.remove())
                .catch(e => console.log('Still cannot play video:', e));
        });
        video.parentElement.appendChild(overlay);
    });
}

/**
 * Add click handlers to all videos to toggle play/pause
 */
function addVideoClickHandlers() {
    const allVideos = document.querySelectorAll('video');
    
    allVideos.forEach(video => {
        video.addEventListener('click', function() {
            if (this.paused) {
                this.play().catch(e => console.log('Video play prevented:', e));
            } else {
                this.pause();
            }
        });
    });
}

/**
 * Force all videos to play on page load
 */
function forcePlayVideos() {
    // Try to play all videos that should be visible
    const activeSlides = document.querySelectorAll('.gallery-slide.active, .comp-slide.active');
    activeSlides.forEach(slide => {
        const videos = slide.querySelectorAll('video');
        videos.forEach(video => {
            // Ensure the videos have the right attributes
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            
            // Give special attention to the first gallery slide video
            if (slide === document.querySelector('.gallery-slide:first-child')) {
                // Remove any existing overlay
                const existingOverlay = video.parentElement.querySelector('.video-play-overlay');
                if (existingOverlay) {
                    existingOverlay.remove();
                }
                
                // Force play without adding overlay on error
                video.play().catch(e => console.log('First video autoplay prevented:', e));
            } else {
                playVideo(video);
            }
        });
    });
    
    // Add click handlers to all videos
    addVideoClickHandlers();
    
    // Remove any existing play overlays from the first gallery slide
    const firstGallerySlide = document.querySelector('.gallery-slide:first-child');
    if (firstGallerySlide) {
        const overlays = firstGallerySlide.querySelectorAll('.video-play-overlay');
        overlays.forEach(overlay => overlay.remove());
    }
    
    // Setup IntersectionObserver for videos (autoplay when in view)
    if ('IntersectionObserver' in window) {
        const videoObserver = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.target.closest('.active')) {
                    playVideo(entry.target);
                } else {
                    entry.target.pause();
                }
            });
        }, { threshold: 0.5 });
        
        // Observe all videos
        document.querySelectorAll('video').forEach(video => {
            videoObserver.observe(video);
        });
    }
    
    // Move all video containers inside iframe containers
    document.querySelectorAll('.gallery-slide').forEach(slide => {
        const videoContainer = slide.querySelector('.video-container');
        const iframeContainer = slide.querySelector('.iframe-container');
        
        if (videoContainer && iframeContainer) {
            iframeContainer.appendChild(videoContainer);
        }
    });
    
    // Add window resize event listener
    window.addEventListener('resize', () => {
        adjustVideoContainerPositions();
    });
    
    // Initial adjustment of video container positions
    setTimeout(adjustVideoContainerPositions, 100);
}