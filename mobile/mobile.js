// ==========================================
// STATE MANAGEMENT
// ==========================================
const cart = {
  package: null,
  addons: new Set()
};

const tooltipContent = {
  odor: 'Professional ozone treatment and deep cleaning to eliminate stubborn odors from smoke, pets, mildew, and more.',
  pet: 'Specialized tools and techniques to remove embedded pet hair from all surfaces, including hard-to-reach areas.',
  intensive: 'Additional time and attention for heavily soiled vehicles requiring extra care and multiple passes.'
};

// ==========================================
// DOM ELEMENTS
// ==========================================
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-menu a');
const serviceCards = document.querySelectorAll('.service-card');
const addonItems = document.querySelectorAll('.addon-item');
const ctaButton = document.querySelector('.sticky-cta');
const tooltip = document.getElementById('info-tooltip');
const tooltipText = tooltip?.querySelector('.tooltip-text');
const closeTooltip = tooltip?.querySelector('.close-tooltip');
const carouselTrack = document.getElementById('carousel-track');

// ==========================================
// HAMBURGER MENU
// ==========================================
function toggleMenu() {
  const isOpen = hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function closeMenu() {
  hamburger.classList.remove('active');
  navMenu.classList.remove('active');
  hamburger.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

if (hamburger) {
  hamburger.addEventListener('click', toggleMenu);
}

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    setTimeout(closeMenu, 500);

    const targetId = link.getAttribute('href');
    const targetSection = document.querySelector(targetId);

    if (targetSection) {
      const headerHeight = document.querySelector('header').offsetHeight;
      const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - headerHeight - 16;

      window.scrollTo({
        top: targetPosition,
        behavior: 'smooth'
      });
    }
  });
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
  if (navMenu.classList.contains('active') &&
      !navMenu.contains(e.target) &&
      !hamburger.contains(e.target)) {
    closeMenu();
  }
});

// ==========================================
// EXPANDABLE SERVICE CARDS
// ==========================================
serviceCards.forEach(card => {
  const header = card.querySelector('.service-header');
  const expandBtn = card.querySelector('.expand-btn');

  if (header && expandBtn) {
    header.addEventListener('click', (e) => {
      // Don't expand if clicking on info icon
      if (e.target.closest('.info-icon')) {
        return;
      }

      // If it's a package card, toggle selection
      const packageType = card.dataset.package;
      if (packageType) {
        handlePackageSelection(card, packageType);
      }

      // Toggle expansion
      const wasExpanded = card.classList.contains('expanded');

      // Close all other cards on mobile
      if (window.innerWidth < 768) {
        serviceCards.forEach(c => c.classList.remove('expanded'));
      }

      // Toggle this card
      if (!wasExpanded) {
        card.classList.add('expanded');
      } else {
        card.classList.remove('expanded');
      }
    });
  }
});

// ==========================================
// PACKAGE SELECTION
// ==========================================
function handlePackageSelection(card, packageType) {
  const wasSelected = card.classList.contains('selected');

  // Remove selection from all package cards
  serviceCards.forEach(c => {
    if (c.dataset.package) {
      c.classList.remove('selected');
    }
  });

  // Remove package classes from addons
  addonItems.forEach(item => {
    item.classList.remove('package-basic', 'package-complete', 'package-luxe');
  });

  // Remove CTA selection
  ctaButton.classList.remove('selected-basic', 'selected-complete', 'selected-luxe');

  if (!wasSelected) {
    // Select this package
    card.classList.add('selected');
    cart.package = packageType;

    // Add package class to addons
    addonItems.forEach(item => {
      item.classList.add(`package-${packageType}`);
    });

    // Update CTA button
    ctaButton.classList.add(`selected-${packageType}`);
  } else {
    // Deselect
    cart.package = null;
  }
}

// ==========================================
// ADDON SELECTION
// ==========================================
addonItems.forEach(addon => {
  addon.addEventListener('click', (e) => {
    // Don't toggle if clicking info icon
    if (e.target.closest('.info-icon')) {
      return;
    }

    const service = addon.dataset.service;
    addon.classList.toggle('selected');

    if (addon.classList.contains('selected')) {
      cart.addons.add(service);
    } else {
      cart.addons.delete(service);
    }
  });
});

// ==========================================
// TOOLTIP MANAGEMENT
// ==========================================
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

// Info icon handlers
document.querySelectorAll('.info-icon').forEach(icon => {
  icon.addEventListener('click', (e) => {
    e.stopPropagation();
    const service = icon.closest('[data-service]')?.dataset.service;
    if (service) {
      showTooltip(icon, service);
    }
  });
});

if (closeTooltip) {
  closeTooltip.addEventListener('click', hideTooltip);
}

// Close tooltip when clicking outside
document.addEventListener('click', (e) => {
  if (tooltip?.classList.contains('visible') &&
      !tooltip.contains(e.target) &&
      !e.target.closest('.info-icon')) {
    hideTooltip();
  }
});

// ==========================================
// CAROUSEL
// ==========================================
function startCarouselInfiniteScroll(track, speed = 160) {
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

  function step(timestamp) {
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

// ==========================================
// CHECKOUT
// ==========================================
function checkout() {
  const redirectMap = {
    default: 'https://form.jotform.com/ventureinvictus/detail-intake-form',
    basic: 'https://form.jotform.com/252885754777175/prefill/6907e43a6630306492fa85154c7b',
    complete: 'https://form.jotform.com/252885754777175/prefill/6907e504663030691fb23fb27c1a',
    luxe: 'https://form.jotform.com/252885754777175/prefill/6907e523616339f110ed07a8ef0a'
  };

  let target = redirectMap.default;

  if (cart.package) {
    target = redirectMap[cart.package];
  }

  console.log('Checkout:', {
    package: cart.package,
    addons: Array.from(cart.addons)
  });

  window.location.href = target;
}

if (ctaButton) {
  ctaButton.addEventListener('click', checkout);
}

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  startCarouselInfiniteScroll(carouselTrack, 160);

  // Auto-expand first service card on desktop
  if (window.innerWidth >= 768 && serviceCards.length > 0) {
    serviceCards[0].classList.add('expanded');
  }
});

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (window.innerWidth >= 768) {
      closeMenu();
    }
  }, 250);
});
