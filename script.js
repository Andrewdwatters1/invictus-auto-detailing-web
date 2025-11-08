// ==========================================
// FEATURE FLAGS
// ==========================================
const FEATURES = {
  cart: false,
  reviews: false,
  exitModal: true // Desktop only when enabled
};

// ==========================================
// DEVICE DETECTION
// ==========================================
let isMobile; // set to a bool in DOMContentLoaded

// ==========================================
// DOM ELEMENTS - SHARED
// ==========================================
const navLinks = document.querySelectorAll('.nav-menu a.scroller');
const ctaButton = document.querySelector('.sticky-cta');
const tooltip = document.getElementById('info-tooltip');
const tooltipText = tooltip?.querySelector('.tooltip-text');
const carouselTrack = document.getElementById('carousel-track');

// ==========================================
// DOM ELEMENTS - MOBILE SPECIFIC
// ==========================================
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const serviceCards = document.querySelectorAll('.service-card');

// ==========================================
// DOM ELEMENTS - DESKTOP SPECIFIC
// ==========================================
const packages = document.querySelectorAll('.service:not(.add-ons)');

// ==========================================
// DOM ELEMENTS - BOTH (but different selectors)
// ==========================================
const addonItems = document.querySelectorAll('.addon-item');
const infoBtns = document.querySelectorAll('i.fa-solid.fa-circle-info, .info-icon');
const closeTooltipBtn = tooltip?.querySelector('.close-tooltip');

// ==========================================
// TOOLTIP CONTENT
// ==========================================
const tooltipContent = {
  odor: 'Professional ozone treatment and deep cleaning to eliminate stubborn odors from smoke, pets, mildew, and more.',
  pet: 'Specialized tools and techniques to remove embedded pet hair from all surfaces, including hard-to-reach areas.',
  intensive: 'Additional time and attention for heavily soiled vehicles requiring extra care and multiple passes.'
};

// ==========================================
// CART STATE
// ==========================================
const cart = {
  package: null, // 'basic', 'complete', or 'luxe'
  addons: new Set() // Set of addon service names
};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  isMobile = window.innerWidth < 768;

  setupNavigation();
  setupPackageSelection();
  setupAddonSelection();
  setupInfoTooltips();
  startCarousel();

  if (FEATURES.exitModal && !isMobile) {
    activateExitIntent('#customExitModal');
  }
});

// ==========================================
// NAVIGATION
// ==========================================
function setupNavigation() {
  // Smooth scroll for nav links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      // Close mobile menu if open
      if (isMobile && navMenu?.classList.contains('active')) {
        setTimeout(closeMobileMenu, 500);
      }

      const targetId = link.getAttribute('href');
      const targetSection = document.querySelector(targetId);

      if (targetSection) {
        const headerHeight = document.querySelector('header').offsetHeight;
        const offset = isMobile ? headerHeight + 16 : 125;
        const targetPosition = targetSection.getBoundingClientRect().top + window.pageYOffset - offset;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Mobile hamburger menu
  if (hamburger && navMenu) {
    hamburger.addEventListener('click', toggleMobileMenu);

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('active') &&
          !navMenu.contains(e.target) &&
          !hamburger.contains(e.target)) {
        closeMobileMenu();
      }
    });
  }

  // Handle window resize
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      if (window.innerWidth >= 768 && navMenu?.classList.contains('active')) {
        closeMobileMenu();
      }
    }, 250);
  });
}

function toggleMobileMenu() {
  const isOpen = hamburger.classList.toggle('active');
  navMenu.classList.toggle('active');
  hamburger.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function closeMobileMenu() {
  hamburger?.classList.remove('active');
  navMenu?.classList.remove('active');
  hamburger?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

// ==========================================
// PACKAGE SELECTION
// ==========================================
function setupPackageSelection() {
  if (isMobile) {
    setupMobilePackageSelection();
  } else {
    setupDesktopPackageSelection();
  }
}

function setupMobilePackageSelection() {
  serviceCards.forEach(card => {
    const header = card.querySelector('.service-header');
    const expandBtn = card.querySelector('.expand-btn');

    if (header && expandBtn) {
      header.addEventListener('click', (e) => {
        // Don't expand if clicking info icon
        if (e.target.closest('.info-icon')) {
          return;
        }

        const packageType = card.dataset.package;
        if (packageType) {
          handlePackageSelection(card, packageType);
        }

        // Toggle expansion
        const wasExpanded = card.classList.contains('expanded');

        // Close all other cards
        serviceCards.forEach(c => c.classList.remove('expanded'));

        // Toggle this card
        if (!wasExpanded) {
          card.classList.add('expanded');
        }
      });
    }
  });
}

function setupDesktopPackageSelection() {
  packages.forEach(pkg => {
    pkg.addEventListener('click', () => {
      const wasSelected = pkg.classList.contains('selected');

      if (wasSelected) {
        // Deselect
        pkg.classList.remove('selected');
        cart.package = null;
        ctaButton.classList.remove('selected-basic', 'selected-complete', 'selected-luxe');

        // Remove package classes from addons
        addonItems.forEach(item => {
          item.classList.remove('package-basic', 'package-complete', 'package-luxe');
        });
      } else {
        // Deselect all packages
        packages.forEach(p => p.classList.remove('selected'));

        // Select this package
        pkg.classList.add('selected');

        // Determine package type
        let packageType = null;
        if (pkg.classList.contains('basic')) {
          packageType = 'basic';
          ctaButton.classList.remove('selected-complete', 'selected-luxe');
          ctaButton.classList.add('selected-basic');
        } else if (pkg.classList.contains('complete')) {
          packageType = 'complete';
          ctaButton.classList.remove('selected-basic', 'selected-luxe');
          ctaButton.classList.add('selected-complete');
        } else if (pkg.classList.contains('luxe')) {
          packageType = 'luxe';
          ctaButton.classList.remove('selected-basic', 'selected-complete');
          ctaButton.classList.add('selected-luxe');
        }

        cart.package = packageType;

        // Update addon classes
        addonItems.forEach(item => {
          item.classList.remove('package-basic', 'package-complete', 'package-luxe');
          item.classList.add(`package-${packageType}`);
        });
      }
    });
  });
}

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
function setupAddonSelection() {
  addonItems.forEach(addon => {
    addon.addEventListener('click', (e) => {
      // Don't toggle if clicking info icon
      if (e.target.closest('.info-icon') || e.target.closest('.fa-circle-info')) {
        return;
      }

      // Get service name from data attribute
      let service = addon.dataset.service;

      // If not found in dataset, look for it in the info icon
      if (!service) {
        const infoIcon = addon.querySelector('.fa-circle-info');
        service = infoIcon?.dataset?.service;
      }

      if (!service) return;

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

// ==========================================
// INFO TOOLTIPS
// ==========================================
function setupInfoTooltips() {
  // Info icon/button handlers
  infoBtns.forEach(icon => {
    if (isMobile) {
      // Mobile: click to show
      icon.addEventListener('click', (e) => {
        e.stopPropagation();
        const service = icon.closest('[data-service]')?.dataset.service ||
                       icon.dataset.service;
        if (service) {
          showTooltip(icon, service);
        }
      });
    } else {
      // Desktop: hover to show
      icon.addEventListener('mouseenter', (e) => {
        const service = e.target.dataset.service ||
                       e.target.closest('[data-service]')?.dataset.service;
        if (service) {
          showTooltip(icon, service);
        }
      });

      icon.addEventListener('mouseleave', hideTooltip);
    }
  });

  // Close button for mobile
  if (closeTooltipBtn) {
    closeTooltipBtn.addEventListener('click', hideTooltip);
  }

  // Close tooltip when clicking outside
  document.addEventListener('click', (e) => {
    if (tooltip?.classList.contains('visible') &&
        !tooltip.contains(e.target) &&
        !e.target.closest('.info-icon') &&
        !e.target.closest('.fa-circle-info')) {
      hideTooltip();
    }
  });
}

function showTooltip(element, service) {
  if (!tooltip || !tooltipText) return;

  tooltipText.textContent = tooltipContent[service] || 'Additional service information.';

  const rect = element.getBoundingClientRect();
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

// ==========================================
// CAROUSEL
// ==========================================
function startCarousel() {
  if (!carouselTrack) return;

  const speed = isMobile ? 50 : 120; // pixels per second
  let currentX = 0;
  let lastTimestamp = null;
  let paused = false;
  let indicator = null;

  const pauseIcon = '<i class="fa-solid fa-pause"></i>';
  const playIcon = '<i class="fa-solid fa-play"></i>';

  // Create indicator element
  function createIndicator() {
    indicator = document.createElement('div');
    indicator.className = 'carousel-indicator';
    indicator.innerHTML = pauseIcon;
    indicator.setAttribute('aria-live', 'polite');
    carouselTrack.parentElement.appendChild(indicator);
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

    if (!paused && carouselTrack.children.length > 0) {
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
    showIndicator(paused ? playIcon : pauseIcon);
  });

  // Initialize
  createIndicator();
  carouselTrack.style.transform = 'translateX(0)';
  requestAnimationFrame(step);
}

// ==========================================
// CHECKOUT / CTA
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

  // Future: handle addon selections in URL params if needed
  // const addonParams = Array.from(cart.addons).join(',');

  window.location.href = target;
}

// Attach checkout to CTA button
if (ctaButton) {
  ctaButton.addEventListener('click', checkout);
}

// ==========================================
// EXIT INTENT MODAL (Desktop Only)
// ==========================================
function activateExitIntent(modalSelector) {
  if (isMobile) return; // Don't run on mobile

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
  let lastFocusedEl = null;

  // Check if already shown this session
  if (sessionStorage.getItem('exitModalShown')) {
    popupHasShown = true;
  }

  // Show modal function
  const showModal = () => {
    if (!popupHasShown) {
      modal.classList.add('show');
      document.body.classList.add('modal-open');
      modal.style.setProperty("position", "fixed", "important");

      lastFocusedEl = document.activeElement;
      const cta = document.querySelector('#customExitModal .exit-modal-cta')
      if (cta) cta.focus();

      popupHasShown = true;
      sessionStorage.setItem('exitModalShown', 'true');
    }
  };

  // Hide modal function
  const hideModal = () => {
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
    modal.style.setProperty("position", "static", "important");
    lastFocusedEl ? lastFocusedEl.focus() : document.body.focus();
  };

  // Desktop: Mouse leaving viewport
  document.addEventListener('mouseleave', function(e) {
    triggerTime = Date.now();
  });

  document.addEventListener('mouseout', function(e) {
    const isLeaving = (Date.now() - triggerTime) > 10 && !e.toElement && !e.relatedTarget;
    if (isLeaving && !popupHasShown && e.clientY < 50) {
      showModal();
    }
  });

  // Close button
  if (closeBtn) {
    closeBtn.addEventListener('click', hideModal);
  }

  // Decline button
  if (declineBtn) {
    declineBtn.addEventListener('click', hideModal);
  }

  // CTA button
  if (ctaBtn) {
    ctaBtn.addEventListener('click', () => {
      hideModal();
      checkout();
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
