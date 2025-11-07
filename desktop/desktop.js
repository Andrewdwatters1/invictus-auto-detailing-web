// ENABLE/DISABLE FEATURES
let cartEnabled = false;
let reviewsEnabled = false;
let beforeExitModalEnabled = false; // TODO complete me

// DOM Nodes
const packages = document.querySelectorAll('.service:not(.add-ons)');
const addonItems = document.querySelectorAll('.addon-item');
const ctaButton = document.querySelector('.sticky-cta');
const tooltip = document.getElementById('info-tooltip');
const tooltipText = tooltip.querySelector('.tooltip-text');
const infoBtns = document.querySelectorAll('i.fa-solid.fa-circle-info');
const carouselTrack = document.getElementById('carousel-track');
const navLinks = document.querySelectorAll('a.scroller');

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

  startCarouselInfiniteScroll(carouselTrack, 120); // pixels per second

  if (reviewsEnabled) startReviewsCarousel();
  if (beforeExitModalEnabled) activateExitIntent('#customExitModal');
});

// Smooth scroll for navigation links
function setupNavLinkSmoothScroll() {
  navLinks.forEach(link => {
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
}

function setupInfoTooltips() {
  infoBtns.forEach(icon => {
    icon.addEventListener('mouseenter', (e) => {
      const service = e.target.dataset.service;
      showTooltip(icon, service);
    });

    icon.addEventListener('mouseleave', () => {
      hideTooltip();
    });
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.fa-circle-info')) {
      hideTooltip();
    }
  });
}

function showTooltip(iconElement, service) {
  const rect = iconElement.getBoundingClientRect();
  tooltipText.textContent = tooltipContent[service];

  // Position below the icon
  tooltip.style.left = rect.left + (rect.width / 2) + 'px';
  tooltip.style.top = rect.bottom + 8 + 'px';
  tooltip.style.transform = 'translateX(-50%)';

  tooltip.classList.add('visible');
};

function hideTooltip() {
  tooltip.classList.remove('visible');
};

// TODO make speed a percentage of viewport width
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

function startReviewsCarousel() {
  const reviewWidget = document.querySelector('.review-widget');
  const reviewSlides = document.querySelectorAll('.review-slide');
  if (!reviewWidget || !reviewSlides) {
    return;
  }

  let currentReview = 0;
  const reviewInterval = 5000; // 5 seconds

  function scrollToReview(index) {
    const offset = -index * 100;
    reviewWidget.style.transform = `translateX(${offset}%)`;
  }

  function nextReview() {
    currentReview = (currentReview + 1) % reviewSlides.length;
    scrollToReview(currentReview);
  }

  // Auto-advance every 5 seconds
  setInterval(nextReview, reviewInterval);

  // Initialize
  scrollToReview(0);
}

// EXIT INTENT MODAL - Complete Setup
function activateExitIntent(modalSelector) {
  const modal = document.querySelector(modalSelector);

  if (!modal) {
    console.warn(`Modal with selector "${modalSelector}" not found`);
    return;
  }

  const closeBtn = modal.querySelector('.exit-modal-close');
  const declineBtn = modal.querySelector('.exit-modal-decline');
  const ctaBtn = modal.querySelector('.exit-modal-cta');

  let popupHasShown = false;
  let triggerTime = null;

  // Check if already shown this session
  if (sessionStorage.getItem('exitModalShown')) {
    popupHasShown = true;
  }

  // Show modal function
  const showModal = () => {
    if (!popupHasShown) {
      modal.classList.add('show');
      document.body.classList.add('modal-open');
      popupHasShown = true;
      sessionStorage.setItem('exitModalShown', 'true');
    }
  };

  // Hide modal function
  const hideModal = () => {
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
  };

  // --- Desktop Detection: Mouse leaving the top of the viewport ---
  document.addEventListener('mouseleave', function(e) {
    triggerTime = Date.now();
  });

  document.addEventListener('mouseout', function(e) {
    const isLeaving = (Date.now() - triggerTime) > 10 && !e.toElement && !e.relatedTarget;
    if (isLeaving && !popupHasShown && e.clientY < 50) {
      showModal();
    }
  });

  // --- Mobile Detection: Back button ---
  window.addEventListener('popstate', () => {
    if (!popupHasShown) {
      showModal();
      // Push state back so modal can be closed
      window.history.pushState(null, '', window.location.href);
    }
  });

  // --- Close Modal Event Handlers ---

  // Close button
  if (closeBtn) {
    closeBtn.addEventListener('click', hideModal);
  }

  // Decline button
  if (declineBtn) {
    declineBtn.addEventListener('click', hideModal);
  }

  // CTA button (calls checkout, then closes)
  if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
      hideModal();
      // checkout() is called via onclick in HTML
    });
  }

  // Close when clicking outside modal content
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      hideModal();
    }
  });

  // Close with Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('show')) {
      hideModal();
    }
  });
}

// TODO when a package is selected the add-ons section should automatically expand...
// TODO decide on behavior when package is de-selected (close add-ons, remove from cart, etc)
function setupPackageSelectionBehavior() {
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
          // updateCart(); // TODO
          cart.package = 'basic';
          ctaButton.classList.remove('selected-complete', 'selected-luxe');
          ctaButton.classList.add('selected-basic');

        } else if (pkg.classList.contains('complete')) {
          // updateCart(); // TODO
          cart.package = 'complete';
          ctaButton.classList.remove('selected-basic', 'selected-luxe');
          ctaButton.classList.add('selected-complete');

        } else if (pkg.classList.contains('luxe')) {
          // updateCart(); // TODO
          cart.package = 'luxe';
          ctaButton.classList.remove('selected-basic', 'selected-complete');
          ctaButton.classList.add('selected-luxe');
        }
      }
    });
  });
}

function setupAddonSelectionBehavior() {
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
}

// Checkout (Redirect to Intake)
function checkout() {

  const selections = {
    package: cart.package,
    addons: Array.from(cart.addons)
  };

  const redirectMap = {
    default: 'https://form.jotform.com/ventureinvictus/detail-intake-form',
    basic: 'https://form.jotform.com/252885754777175/prefill/6907e43a6630306492fa85154c7b',
    complete: 'https://form.jotform.com/252885754777175/prefill/6907e504663030691fb23fb27c1a',
    luxe: 'https://form.jotform.com/252885754777175/prefill/6907e523616339f110ed07a8ef0a'
  }

  let target = redirectMap.default;

  // if(cart.addons.size === 0) {
    if(cart.package === 'basic') {
      target = redirectMap.basic;
    } else if (cart.package === 'complete') {
      target = redirectMap.complete;
    } else if (cart.package === 'luxe') {
      target = redirectMap.luxe;
    }
  // } else {
    // do stuff
  // }

  window.location.assign(target);
  return;
}
