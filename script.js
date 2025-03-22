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

    // Initialize dataset buttons for comparison section
    initDatasetButtons();
});

/**
 * Initialize the main interactive results gallery
 */
function initMainGallery() {
    const slides = document.querySelectorAll('.gallery-slide:not(.comp-slide)');
    const prevBtn = document.querySelector('.gallery-nav.prev:not(.comp-prev)');
    const nextBtn = document.querySelector('.gallery-nav.next:not(.comp-next)');
    const indicators = document.querySelectorAll('.gallery-indicator:not(.comp-indicator)');
    
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
     * @param {number} index - The index of the slide to display
     */
    function updateSlide(index) {
        // Hide all slides
        slides.forEach(slide => slide.classList.remove('active'));
        
        // Show the selected slide
        slides[index].classList.add('active');
        
        // Update indicator states
        indicators.forEach(indicator => indicator.classList.remove('active'));
        indicators[index].classList.add('active');
        
        // Update current index
        currentSlideIndex = index;
        
        // Play videos in the active slide, pause others
        slides.forEach((slide, i) => {
            const videos = slide.querySelectorAll('video');
            videos.forEach(video => {
                if (i === index) {
                    playVideo(video);
                } else {
                    video.pause();
                }
            });
        });
    }
    
    /**
     * Move to the next slide in the gallery
     */
    function nextSlide() {
        let newIndex = currentSlideIndex + 1;
        if (newIndex >= slides.length) {
            newIndex = 0; // Loop to the first slide
        }
        updateSlide(newIndex);
    }
    
    /**
     * Move to the previous slide in the gallery
     */
    function previousSlide() {
        let newIndex = currentSlideIndex - 1;
        if (newIndex < 0) {
            newIndex = slides.length - 1; // Loop to the last slide
        }
        updateSlide(newIndex);
    }
    
    // Add event listeners for navigation
    nextBtn.addEventListener('click', nextSlide);
    prevBtn.addEventListener('click', previousSlide);
    
    // Add event listeners for indicator dots
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => updateSlide(index));
    });
    
    // Initialize the first slide
    updateSlide(0);
}

/**
 * Initialize the comparison gallery
 */
function initComparisonGallery() {
    const compSlides = document.querySelectorAll('.comp-slide');
    const compPrevBtn = document.querySelector('.gallery-nav.comp-prev');
    const compNextBtn = document.querySelector('.gallery-nav.comp-next');
    const compIndicators = document.querySelectorAll('.gallery-indicator.comp-indicator');
    
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
        // Hide all slides
        compSlides.forEach(slide => slide.classList.remove('active'));
        
        // Show the selected slide
        compSlides[index].classList.add('active');
        
        // Update indicator states if they exist
        if (compIndicators.length) {
            compIndicators.forEach(indicator => indicator.classList.remove('active'));
            
            if (compIndicators[index]) {
                compIndicators[index].classList.add('active');
            }
        }
        
        // Update current index
        currentCompSlideIndex = index;
        
        // Play videos in the active slide, pause others
        compSlides.forEach((slide, i) => {
            const videos = slide.querySelectorAll('video');
            videos.forEach(video => {
                if (i === index) {
                    playVideo(video);
                } else {
                    video.pause();
                }
            });
        });
        
        // Update dataset buttons to match the active slide
        updateDatasetButtons(index);
    }
    
    /**
     * Move to the next comparison slide
     */
    function nextCompSlide() {
        let newIndex = currentCompSlideIndex + 1;
        if (newIndex >= compSlides.length) {
            newIndex = 0;
        }
        updateCompSlide(newIndex);
    }
    
    /**
     * Move to the previous comparison slide
     */
    function previousCompSlide() {
        let newIndex = currentCompSlideIndex - 1;
        if (newIndex < 0) {
            newIndex = compSlides.length - 1;
        }
        updateCompSlide(newIndex);
    }
    
    // Add event listeners for navigation if the buttons exist
    if (compPrevBtn) {
        compPrevBtn.addEventListener('click', previousCompSlide);
    }
    
    if (compNextBtn) {
        compNextBtn.addEventListener('click', nextCompSlide);
    }
    
    // Add event listeners for indicator dots
    compIndicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => updateCompSlide(index));
    });
    
    // Initialize the first comparison slide
    updateCompSlide(0);
}

/**
 * Initialize dataset buttons for the comparison section
 */
function initDatasetButtons() {
    const datasetButtons = document.querySelectorAll('.dataset-btn');
    const compSlides = document.querySelectorAll('.comp-slide');
    
    if (!datasetButtons.length || !compSlides.length) {
        return;
    }
    
    // Function to update the active dataset button
    function updateDatasetButtons(index) {
        const activeSlide = compSlides[index];
        if (!activeSlide) return;
        
        const datasetTitle = activeSlide.querySelector('.dataset-title')?.textContent.toLowerCase();
        
        // Update button states
        datasetButtons.forEach(btn => {
            const btnDataset = btn.dataset.dataset.toLowerCase();
            
            if (btnDataset === datasetTitle) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }
    
    // Add click event listener to each button
    datasetButtons.forEach(button => {
        button.addEventListener('click', function() {
            const dataset = this.dataset.dataset.toLowerCase();
            
            // Find the index of the slide with the matching dataset
            let targetIndex = Array.from(compSlides).findIndex(slide => 
                slide.querySelector('.dataset-title').textContent.toLowerCase() === dataset
            );
            
            if (targetIndex !== -1) {
                // Find and trigger the corresponding indicator
                const indicator = document.querySelector(`.gallery-indicator.comp-indicator[data-index="${targetIndex}"]`);
                if (indicator) {
                    indicator.click();
                }
            }
        });
    });
}

// /**
//  * Helper function to play a video with error handling
//  * @param {HTMLVideoElement} video - The video element to play
//  */
// function playVideo(video) {
//     if (video.paused) {
//         video.play().catch(error => {
//             console.log('Video autoplay prevented:', error);
            
//             // Add a playback overlay to indicate the video needs to be clicked
//             if (!video.parentElement.querySelector('.video-play-overlay')) {
//                 const overlay = document.createElement('div');
//                 overlay.className = 'video-play-overlay';
//                 overlay.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
//                 overlay.addEventListener('click', () => {
//                     video.play().then(() => {
//                         overlay.remove();
//                     }).catch(e => console.log('Still cannot play video:', e));
//                 });
//                 video.parentElement.appendChild(overlay);
//             }
//         });
//     }
// }

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
            playVideo(video);
        });
    });
    
    // Add click handlers to all videos
    addVideoClickHandlers();
    
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
}