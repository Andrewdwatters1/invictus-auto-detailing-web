// ===== Gallery Carousel with Blur Effect =====
const carouselTrack = document.querySelector('.carousel-track');
var carouselItems = document.querySelectorAll('.carousel-item');
let carouselIndex = -1;

window.addEventListener('load', () => {
  // updateCarousel();
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
// ***
const infoBtns = document.querySelectorAll('i.fa-solid.fa-circle-info');
const tooltip = document.querySelector('#info-tooltip');
const tooltipClose = document.querySelector('button.close-tooltip');
[...infoBtns, tooltipClose].forEach((item, idx) => {
  item.addEventListener('click', e => {
    tooltip.classList.toggle('active');
    console.log(tooltip);
    console.log(Object.values(e.target.dataset)[0])
  })
})
