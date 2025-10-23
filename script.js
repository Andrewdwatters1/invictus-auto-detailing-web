// ===== Gallery Carousel with Blur Effect =====
const carouselTrack = document.querySelector('.carousel-track');
const carouselItems = document.querySelectorAll('.carousel-item');
let carouselIndex = 0;

const updateCarousel = () => {
  // Calculate cumulative offset to center current item
  let offset = 0;

  for (let i = 0; i < carouselIndex; i++) {
    const itemWidth = carouselItems[i].offsetWidth;
    const margin = 20; // 10px on each side
    offset += itemWidth + margin;
  }

  // Add half of current item width to center it
  if (carouselItems[carouselIndex]) {
    offset += carouselItems[carouselIndex].offsetWidth / 2;
  }

  carouselTrack.style.transform = `translate(calc(-50% - ${offset}px), -50%)`;

  // Apply blur to non-center slides
  carouselItems.forEach((item, index) => {
    if (index === carouselIndex) {
      item.classList.remove('blur-side');
    } else {
      item.classList.add('blur-side');
    }
  });
};

// Initialize carousel after images load
window.addEventListener('load', () => {
  updateCarousel();
});

// Also update on resize
window.addEventListener('resize', updateCarousel);

// Auto-rotate carousel every 5 seconds
setInterval(() => {
  carouselIndex = (carouselIndex + 1) % carouselItems.length;
  updateCarousel();
}, 5000);
