// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  const carouselTrack = document.getElementById('carousel-track');
  startCarouselInfiniteScroll(carouselTrack, 160); // pixels per second
});

function startCarouselInfiniteScroll(carouselTrack, speed = 160) {
  let currentX = 0;
  let lastTimestamp = null;
  let paused = false;
  let indicator = null;

  const pauseIndicator = '<i class="fa-solid fa-pause"></i>';
  const playIndicator = '<i class="fa-solid fa-play"></i>'

  // Create indicator element
  function createIndicator() {
    indicator = document.createElement('div');
    indicator.className = 'carousel-indicator';
    // indicator.textContent = '⏸️';
    indicator.innerHTML = pauseIndicator;
    document.querySelector('.carousel-container').appendChild(indicator);
  }

  function showIndicator(symbol) {
    indicator.classList.add('show');
    clearTimeout(indicator._hideTimeout);
    indicator._hideTimeout = setTimeout(() => {
      indicator.innerHTML = symbol;
    }, 300);
    indicator._hideTimeout = setTimeout(() => {
      indicator.classList.remove('show');
    }, 300);

  }

  function step(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const delta = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (!paused) {
      currentX -= speed * delta;

      const firstItem = carouselTrack.children[0];
      const itemRect = firstItem.getBoundingClientRect();
      const style = getComputedStyle(firstItem);
      const marginRight = parseFloat(style.marginRight) || 0;
      const totalWidth = itemRect.width + marginRight;

      if (Math.abs(currentX) >= totalWidth) {
        currentX += totalWidth;
        carouselTrack.appendChild(firstItem);
      }

      carouselTrack.style.transform = `translateX(${currentX}px)`;
    }

    requestAnimationFrame(step);
  }

  // Toggle pause/play when clicking the track
  carouselTrack.addEventListener('click', () => {
    paused = !paused;
    showIndicator(paused ? playIndicator : pauseIndicator);
  });

  // Initialize
  createIndicator();
  carouselTrack.style.transform = 'translateX(0)';
  requestAnimationFrame(step);
}

const packages = document.querySelectorAll('.service:not(.add-ons)');
const addonItems = document.querySelectorAll('.addon-item');
const ctaButton = document.querySelector('.sticky-cta');
const tooltip = document.getElementById('info-tooltip');
const tooltipText = tooltip.querySelector('.tooltip-text');
const infoBtns = document.querySelectorAll('i.fa-solid.fa-circle-info');

const tooltipContent = { // TODO
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
infoBtns.forEach(icon => {
  icon.addEventListener('mouseenter', (e) => {
    const service = e.target.dataset.service;
    showTooltip(icon, service);
  });

  icon.addEventListener('mouseleave', () => {
    hideTooltip();
  });

  // Mobile: tap behavior - stop propagation so it doesn't trigger addon selection
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
      const headerHeight = 125;
      const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Cart management
const cart = {
  package: null, // 'basic', 'complete', or 'luxe'
  addons: new Set() // Set of addon service names
};

// Package selection for CTA button
packages.forEach(pkg => {
  pkg.addEventListener('click', (e) => {

    if (pkg.classList.contains('selected')) {

      addonItems.forEach(item => {
        item.classList.toggle(`package-${pkg.classList[1]}`)
      })

      pkg.classList.remove('selected');

      cart.package = null;
      ctaButton.classList.remove('selected-basic', 'selected-complete', 'selected-luxe');

    } else {

      addonItems.forEach(item => {
        item.classList.remove('package-basic', 'package-complete', 'package-luxe')
        item.classList.add(`package-${pkg.classList[1]}`)
      })

      packages.forEach(p => p.classList.remove('selected'));
      pkg.classList.add('selected');

      if (pkg.classList.contains('basic')) {
        cart.package = 'basic';
        ctaButton.classList.remove('selected-complete', 'selected-luxe');
        ctaButton.classList.add('selected-basic');

      } else if (pkg.classList.contains('complete')) {
        cart.package = 'complete';
        ctaButton.classList.remove('selected-basic', 'selected-luxe');
        ctaButton.classList.add('selected-complete');

      } else if (pkg.classList.contains('luxe')) {
        cart.package = 'luxe';
        ctaButton.classList.remove('selected-basic', 'selected-complete');
        ctaButton.classList.add('selected-luxe');
      }
    }




    // Update cart with package selection

    console.log(ctaButton.classList);

  });
});

// Addon selection
addonItems.forEach(addon => {
  addon.addEventListener('click', (e) => {
    // Don't trigger if clicking the info icon
    if (e.target.classList.contains('fa-circle-info')) {
      return;
    }

    const service = addon.querySelector('.fa-circle-info').dataset.service;

    // Toggle selection
    addon.classList.toggle('selected');

    // Update cart
    if (addon.classList.contains('selected')) {
      cart.addons.add(service);
    } else {
      cart.addons.delete(service);
    }
  });
});

// Checkout function - accessible from console
window.checkout = function() {
  const selections = {
    package: cart.package,
    addons: Array.from(cart.addons)
  };

  console.log('Cart Contents:', selections);

  // Return formatted string
  const packageName = cart.package ? cart.package.charAt(0).toUpperCase() + cart.package.slice(1) : 'None';
  const addonNames = selections.addons.length > 0 ? selections.addons.join(', ') : 'None';

  console.log(`Package: ${packageName}`);
  console.log(`Add-ons: ${addonNames}`);

  return selections;
};
