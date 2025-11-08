// ENABLE/DISABLE FEATURES
let cartEnabled = false;
let reviewsEnabled = false;
let beforeExitModalEnabled = false;

// DOM Nodes
const carouselTrack = document.getElementById('carousel-track');

const tooltipContent = {
  odor: 'Professional ozone treatment and deep cleaning to eliminate stubborn odors from smoke, pets, mildew, and more.',
  pet: 'Specialized tools and techniques to remove embedded pet hair from all surfaces, including hard-to-reach areas.',
  intensive: 'Additional time and attention for heavily soiled vehicles requiring extra care and multiple passes.'
};

// Cart State
const cart = {
  package: null, // 'basic', 'complete', or 'luxe'
  addons: new Set() // Set of addon service names
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  setupNavLinkSmoothScroll();
  setupPackageSelectionBehavior();
  setupAddonSelectionBehavior();
  setupInfoTooltips();


  function showTooltip(iconElement, service) {
    if (!tooltip || !tooltipText) return;

    tooltipText.textContent = tooltipContent[service] || 'Additional service information.';

    const rect = iconElement.getBoundingClientRect();
    const tooltipWidth = 300; // Approximate max width

    // Position tooltip
    let left = rect.left + (rect.width / 2);
    let top = rect.bottom + 8;

    // Keep tooltip on screen
    if (left + tooltipWidth / 2 > window.innerWidth) {
      left = window.innerWidth - tooltipWidth / 2 - 16;
    }
    if (left - tooltipWidth / 2 < 0) {
      left = tooltipWidth / 2 + 16;
    }

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
    tooltip.style.transform = 'translateX(-50%)';

    tooltip.classList.add('visible');
  }

  function hideTooltip() {
    if (tooltip) {
      tooltip.classList.remove('visible');
    }
  }


  // TODO make speed a percentage of viewport width
  startCarouselInfiniteScroll(carouselTrack, 120); // pixels per second

  if (reviewsEnabled) startReviewsCarousel();
  if (beforeExitModalEnabled) activateExitIntent('#customExitModal');
});


function startCarouselInfiniteScroll(track, speed = 80) {
  if (!track) return;

  let currentX = 0;
  let lastTimestamp = null;
  let paused = false;
  let indicator = null;

  const pauseIcon = '<i class="fa-solid fa-pause"></i>';
  const playIcon = '<i class="fa-solid fa-play"></i>';

  function createIndicator() {
    indicator = document.createElement('div');
    indicator.className = 'carousel-indicator';
    indicator.innerHTML = pauseIcon;
    indicator.setAttribute('aria-live', 'polite');
    track.parentElement.appendChild(indicator);
  }

  function showIndicator(symbol) {
    if (!indicator) return;
    indicator.classList.add('show');
    clearTimeout(indicator._hideTimeout);
    indicator._hideTimeout = setTimeout(() => {
      indicator.innerHTML = symbol;
      indicator._hideTimeout = setTimeout(() => {
        indicator.classList.remove('show');
      }, 300);
    }, 50);
  }

  function step(timestamp) { // TODO make this more efficient and so it scrolls smoothly (not jumpy)
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (!paused && track.children.length > 0) {
      currentX -= speed * delta;

      const firstItem = track.children[0];
      const itemRect = firstItem.getBoundingClientRect();
      const style = getComputedStyle(firstItem);
      const marginRight = parseFloat(style.marginRight) || 0;
      const totalWidth = itemRect.width + marginRight;

      if (Math.abs(currentX) >= totalWidth) {
        currentX += totalWidth;
        track.appendChild(firstItem);
      }

      track.style.transform = `translateX(${currentX}px)`;
    }

    requestAnimationFrame(step);
  }

  track.addEventListener('click', () => {
    paused = !paused;
    showIndicator(paused ? playIcon : pauseIcon);
  });

  createIndicator();
  track.style.transform = 'translateX(0)';
  requestAnimationFrame(step);
}
