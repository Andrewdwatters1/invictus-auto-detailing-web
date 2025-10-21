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

// Smooth scrolling for header nav links
document.querySelectorAll('header nav a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ===============================
// Continuous Fade Slider
// ===============================
const topImage = document.querySelector('.fade-image img.top');

let fadeIn = true;

setInterval(() => {
  if (fadeIn) {
    topImage.style.opacity = 100;
  } else {
    topImage.style.opacity = 0;
  }
  fadeIn = !fadeIn;
}, 4000); // 2s per transition

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
