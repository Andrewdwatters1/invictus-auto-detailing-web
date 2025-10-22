// ===== Review Widget =====
const reviewSlides = [...document.querySelectorAll('.review-slide')];
let reviewIndex = 0;
const updateReviews = () => {
  reviewSlides.forEach(slide => {
    slide.style.transform = `translateX(-${reviewIndex * 100}%)`;
  });
};
// Auto-rotate reviews every 5 seconds
setInterval(() => {
  reviewIndex = (reviewIndex + 1) % reviewSlides.length;
  updateReviews();
}, 5000);

// ===== Gallery Carousel =====
const carouselTrack = document.querySelector('.carousel-track');
const carouselItems = document.querySelectorAll('.carousel-item');
let carouselIndex = 0;

const updateCarousel = () => {
  const offset = -carouselIndex * 100;
  carouselTrack.style.transform = `translateX(${offset}%)`;
};

// Auto-rotate carousel every 5 seconds
setInterval(() => {
  carouselIndex = (carouselIndex + 1) % carouselItems.length;
  updateCarousel();
}, 5000);

// Smooth scrolling for header nav links
document.querySelectorAll('header nav a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

document.querySelectorAll('.service').forEach(service => {
  service.addEventListener('click', () => {
    const name = service.querySelector('h3').textContent;
    const price = service.querySelector('strong').textContent;
    console.log(`Added ${name} (${price}) to cart`);
    // Here you could trigger a modal, toast, or add to actual cart data structure
  });
});

const toast = document.getElementById('toast');
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2000);
}

document.querySelectorAll('.service, .addon-item').forEach(item => {
  item.addEventListener('click', () => {
    const name = item.querySelector('h3')?.textContent || item.dataset.name;
    const price = item.querySelector('strong')?.textContent || item.dataset.price;
    showToast(`Added ${name} (${price}) to cart ✅`);
  });
});
