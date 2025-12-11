// TODO - Periodically scrape for real reviews and update reviews section, sitemap
// TODO - pre/post commit hooks?


/* ==========================================
   GLOBAL STATE & CONFIGURATION
   ========================================== */
let isMobile = false;

const FEATURES = {
  exitModal: true,
};

// Cart state
const cart = {
  package: null,
  addons: new Set(),
  total: 0
};

// Package prices
const packagePrices = {
  basic: 109,
  complete: 189,
  luxe: 289
};

// Addon prices
const addonPrices = {
  odor: 60,
  pet: 40,
  intensive: 50
};

// Jotform redirect mapping
const redirectMap = {
  default: 'https://form.jotform.com/ventureinvictus/detail-intake-form',
  basic: 'https://form.jotform.com/252885754777175/prefill/6907e43a6630306492fa85154c7b',
  complete: 'https://form.jotform.com/252885754777175/prefill/6907e504663030691fb23fb27c1a',
  luxe: 'https://form.jotform.com/252885754777175/prefill/6907e523616339f110ed07a8ef0a'
};

// TODO future - Use a script or background chron job or something to scrape reviews when they're written and update this object/schema
// location is for SEO, canDisplay is for if it's valid to be included in the Review Schema Markup (SEO)
const reviews = [
  {
    author: 'Philip D.',
    platform: 'Yelp',
    content: `Outstanding. My pickup was in worse shape than I thought, and I wasn't charged any extra for the extra time it took to get clean. It was all done in my driveway with his materials and tools; I only provided a little electricity. Highly recommended.`,
    rating: 5,
    location: 'Broadmoor', // ie neighborhood, great for SEO
    canDisplay: true
  },
  {
    author: 'Linda C.',
    platform: 'NextDoor',
    content: `Andrew did an amazing job. The Subaru in his pictures was my car!!! He was on time, very courteous and worked nonstop. I am so happy with the results and would absolutely recommend him and will definitely use him again!`,
    rating: 5,
    location: 'Chamberlin',
    canDisplay: true
  },
  {
    author: 'Casey S.',
    platform: 'Linkedin',
    content: `I wholeheartedly recommend Andrew Watters. Since 2016, Andrew and I have had the privilege of serving together in the Colorado Army National Guard. He demonstrates all the qualities required of an officer in the United States Army and is a superb leader. Not only is his integrity and commitment to his organization evidence of his attention to detail and desire to serve, but he also demonstrates the technical abilities and critical thinking skills necessary to succeed in any capacity he sets his sights on. I do not doubt that Andrew's principles, work ethic, and professionalism will be an asset to whatever team he joins.`,
    rating: null,
    location: null,
    canDisplay: false
  }
]


document.addEventListener('DOMContentLoaded', () => {
  isMobile = window.innerWidth <= 767;

  setupNavigation();
  setupPackageSelection();
  setupMobileServiceCards();
  setupMobilePackageSelection();
  setupAddonSelection();
  setupInfoTooltips();
  setupFaqToggles();
  setupStickyCTA();
  startCarousel();

  if (FEATURES.exitModal && !isMobile) {
    activateExitIntent('#customExitModal');
  }
});

// Master function for handling pricing
// FUTURE - Stipe calcs go here
function updateCart() {
  let total = 0;

  if (cart.package) {
    total += packagePrices[cart.package];
  }

  cart.addons.forEach(addon => {
    total += addonPrices[addon];
  });

  cart.total = total;
  updateCTAButton();
}


function updateCTAButton() {
  const stickyCTA = document.querySelector('.sticky-cta');

  if (!stickyCTA) return;

  // if (cart.package) {
  //   stickyCTA.textContent = `Book Now - $${cart.total}`;
  // } else {
  //   stickyCTA.textContent = 'Book Now';
  // }
}


function getCheckoutLink() {
  if (!cart.package) {
    return redirectMap.default;
  }

  return redirectMap[cart.package] || redirectMap.default;
}


function setupNavigation() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-menu a');

  if (!hamburger || !navMenu) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
    hamburger.setAttribute('aria-expanded',
      hamburger.classList.contains('active')
    );
  });

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (link.classList.contains('scroller') && link.getAttribute('href').startsWith('#')) {
        e.preventDefault();

        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');

        const targetId = link.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetElement) {
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      }
    });
  });

  document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
}


function setupPackageSelection() {
  const serviceCards = document.querySelectorAll('.service:not(.add-ons)');
  const stickyCTA = document.querySelector('.sticky-cta');

  if (!stickyCTA) return;

  serviceCards.forEach(card => {
    card.addEventListener('click', () => {
      serviceCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      // Update cart package
      if (card.classList.contains('basic')) {
        cart.package = 'basic';
      } else if (card.classList.contains('complete')) {
        cart.package = 'complete';
      } else if (card.classList.contains('luxe')) {
        cart.package = 'luxe';
      }

      updateCart();

      // Update visual styling
      stickyCTA.className = 'sticky-cta';
      if (card.classList.contains('basic')) {
        stickyCTA.classList.add('selected-basic');
      } else if (card.classList.contains('complete')) {
        stickyCTA.classList.add('selected-complete');
      } else if (card.classList.contains('luxe')) {
        stickyCTA.classList.add('selected-luxe');
      }
    });
  });
}


function setupMobileServiceCards() {
  const serviceCards = document.querySelectorAll('.service-card');

  serviceCards.forEach(card => {
    const header = card.querySelector('.service-header');
    const expandBtn = card.querySelector('.expand-btn');

    const toggleCard = () => {
      serviceCards.forEach(otherCard => {
        if (otherCard !== card) {
          otherCard.classList.remove('expanded');
        }
      });

      card.classList.toggle('expanded');
    };

    if (header) {
      header.addEventListener('click', toggleCard);
    }

    if (expandBtn) {
      expandBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleCard();
      });
    }
  });
}


function setupMobilePackageSelection() {
  const packageCards = document.querySelectorAll('.service-card[data-package]');
  const stickyCTA = document.querySelector('.sticky-cta');

  if (!stickyCTA) return;

  packageCards.forEach(card => {
    card.addEventListener('click', () => {
      packageCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');

      const packageType = card.getAttribute('data-package');
      cart.package = packageType;
      updateCart();

      stickyCTA.className = 'sticky-cta';
      stickyCTA.classList.add(`selected-${packageType}`);
    });
  });
}


function setupAddonSelection() {
  const addonItems = document.querySelectorAll('.addon-item');

  addonItems.forEach(item => {
    item.addEventListener('click', (e) => {
      if (!e.target.classList.contains('info-icon') &&
          !e.target.closest('.info-icon') &&
          !e.target.classList.contains('fa-circle-info')) {

        item.classList.toggle('selected');

        const service = item.getAttribute('data-service');
        if (service) {
          if (cart.addons.has(service)) {
            cart.addons.delete(service);
          } else {
            cart.addons.add(service);
          }

          updateCart();
        }
      }
    });
  });
}


function setupInfoTooltips() {
  const tooltip = document.getElementById('info-tooltip');
  if (!tooltip) return;

  const tooltipText = tooltip.querySelector('.tooltip-text');
  const closeBtn = tooltip.querySelector('.close-tooltip');
  const infoIcons = document.querySelectorAll('.info-icon, .fa-circle-info[data-service]');

  const tooltipContent = {
    odor: "Our enzyme-based odor treatment eliminates odor sources rather than masking them. No ozone machines—just powerful enzymatic cleaners that break down smoke, pet, mildew, and other stubborn odors at the molecular level. Works best when paired with deep cleaning. Adds approximately 30-45 minutes to service time.",
    pet: "Specialized tools designed specifically for pet hair removal without damaging or ripping carpet fibers. We use multiple techniques and brushes to extract embedded pet hair from carpets, upholstery, and hard-to-reach crevices. Safe for all fabric types. Perfect for heavy shedders.",
    intensive: "Deep-level treatment for the toughest messes—vomit, pet accidents, food spills, gum, candy, or any biohazard situation. Includes aggressive agitation, industrial-strength cleaners (still safe for fabrics), extended dwell time, and repeated extraction passes until the problem is resolved. May add 45-60 minutes depending on severity."
  };

  infoIcons.forEach(icon => {
    icon.addEventListener('click', (e) => {
      e.stopPropagation();

      const service = icon.getAttribute('data-service') ||
                     icon.closest('.addon-item')?.getAttribute('data-service');
      const content = tooltipContent[service];

      if (content && tooltipText) {
        tooltipText.textContent = content;

        if (isMobile) {
          tooltip.style.top = '50%';
          tooltip.style.left = '50%';
          tooltip.style.transform = 'translate(-50%, -50%)';
        } else {
          const rect = icon.getBoundingClientRect();

          // Force reflow to get accurate tooltip dimensions
          tooltip.style.opacity = '0';
          tooltip.style.display = 'block';
          const tooltipRect = tooltip.getBoundingClientRect();
          tooltip.style.display = '';
          tooltip.style.opacity = '';

          let top = rect.top + window.scrollY - tooltipRect.height - 10;
          let left = rect.left + window.scrollX + (rect.width / 2) - (tooltipRect.width / 2);

          if (top < window.scrollY) {
            top = rect.bottom + window.scrollY + 10;
          }

          if (left < 0) left = 10;
          if (left + tooltipRect.width > window.innerWidth) {
            left = window.innerWidth - tooltipRect.width - 10;
          }

          tooltip.style.top = `${top}px`;
          tooltip.style.left = `${left}px`;
          tooltip.style.transform = 'none';
        }

        tooltip.classList.add('visible');
      }
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      tooltip.classList.remove('visible');
    });
  }

  document.addEventListener('click', (e) => {
    if (!tooltip.contains(e.target) &&
        !e.target.classList.contains('info-icon') &&
        !e.target.closest('.info-icon') &&
        !e.target.classList.contains('fa-circle-info')) {
      tooltip.classList.remove('visible');
    }
  });
}


function setupFaqToggles() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const header = item.querySelector('.faq-question-header');
    const toggle = item.querySelector('.faq-toggle');

    const toggleFaq = () => {
      const wasActive = item.classList.contains('active');

      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
        }
      });

      item.classList.toggle('active');
      toggle.setAttribute('aria-expanded', !wasActive);
    };

    header.addEventListener('click', toggleFaq);
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleFaq();
    });
  });
}


function startCarousel() {
  const carouselTrack = document.getElementById('carousel-track');
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


function setupStickyCTA() {
  const stickyCTA = document.querySelector('.sticky-cta');

  if (!stickyCTA) return;

  stickyCTA.addEventListener('click', () => {
    const link = getCheckoutLink();
    window.open(link, '_blank');
  });
}


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
      window.location.href = getCheckoutLink();
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
