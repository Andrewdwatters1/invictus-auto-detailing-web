// ===== Gallery Carousel with Blur Effect =====
const carouselTrack = document.querySelector('.carousel-track');
var carouselItems = document.querySelectorAll('.carousel-item');
let carouselIndex = -1;

window.addEventListener('load', () => {
  updateBlur()
  setInterval(moveCarousel, 3000)
})


const moveCarousel = () => {
  const firstItem = carouselTrack.children[0];
  const itemWidth = firstItem.getBoundingClientRect().width;

  // Apply smooth scroll transition
  carouselTrack.style.transition = 'transform 1s ease-in-out';
  carouselTrack.style.transform = `translateX(-${itemWidth}px)`;

  // After transition, recycle the first item
  carouselTrack.addEventListener('transitionend', function handler() {
    carouselTrack.style.transition = 'none'; // disable animation for instant move
    carouselTrack.style.transform = 'translateX(0)'; // reset position

    // Move first item to end
    carouselTrack.appendChild(firstItem);

    // Rebuild carouselItems array (since DOM order changed)
    carouselItems = Array.from(carouselTrack.children);

    // Update the blur effect
    updateBlur();

    // Re-enable transition for next move
    void carouselTrack.offsetWidth; // force reflow
    carouselTrack.style.transition = 'transform 1s ease-in-out';

    // Clean up event listener
    carouselTrack.removeEventListener('transitionend', handler);
  });
};

const updateBlur = () => {
  // The "center" item is always index 0 after reset (visually first in line)
  carouselItems.forEach((item, index) => {
    if (index === 0) {
      item.classList.remove('blur-side');
    } else {
      item.classList.add('blur-side');
    }
  });
};

// ***
// Info tooltip functionality
const tooltip = document.getElementById('info-tooltip');
const tooltipText = tooltip.querySelector('.tooltip-text');

const tooltipContent = {
  odor: 'Deep Odor Treatment lorem ipsum',
  pet: 'Pet Hair Treatment lorem ipsum',
  intensive: 'Intensive Care lorem ipsum',
  headlights: 'Headlight Restoration lorem ipsum',
  'both-lights': 'Headlight/Taillight Restoration lorem ipsum'
};

const showTooltip = (iconElement, service) => {
  const rect = iconElement.getBoundingClientRect();
  tooltipText.textContent = tooltipContent[service];

  // Position below the icon
  tooltip.style.left = rect.left + (rect.width / 2) + 'px';
  tooltip.style.top = rect.bottom + 8 + 'px';
  tooltip.style.transform = 'translateX(-50%)';

  tooltip.classList.add('visible');
};

const hideTooltip = () => {
  tooltip.classList.remove('visible');
};

// Desktop: hover behavior
const infoBtns = document.querySelectorAll('i.fa-solid.fa-circle-info');
infoBtns.forEach(icon => {
  icon.addEventListener('mouseenter', (e) => {
    const service = e.target.dataset.service;
    showTooltip(icon, service);
  });

  icon.addEventListener('mouseleave', () => {
    hideTooltip();
  });

  // Mobile: tap behavior
  icon.addEventListener('click', (e) => {
    e.stopPropagation();
    const service = e.target.dataset.service;

    if (tooltip.classList.contains('visible')) {
      hideTooltip();
    } else {
      showTooltip(icon, service);
    }
  });
});

// Close tooltip when clicking outside
document.addEventListener('click', (e) => {
  if (!e.target.closest('.fa-circle-info')) {
    hideTooltip();
  }
});

// Smooth scroll for navigation links
document.querySelectorAll('a.scroller').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const targetId = link.getAttribute('href');
    const targetSection = document.querySelector(targetId);

    if (targetSection) {
      const headerHeight = 110;
      const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});



// Package selection for CTA button
const packages = document.querySelectorAll('.service:not(.add-ons)');
const ctaButton = document.querySelector('.sticky-cta');

packages.forEach(pkg => {
  pkg.addEventListener('click', (e) => {
    // Remove previous selections
    packages.forEach(p => p.classList.remove('selected'));

    // Add selected class to clicked package
    pkg.classList.add('selected');

    // Update CTA button style based on package
    ctaButton.classList.remove('selected-basic', 'selected-complete', 'selected-luxe');

    if (pkg.classList.contains('basic')) {
      ctaButton.classList.add('selected-basic');
    } else if (pkg.classList.contains('complete')) {
      ctaButton.classList.add('selected-complete');
    } else if (pkg.classList.contains('luxe')) {
      ctaButton.classList.add('selected-luxe');
    }
  });
});
