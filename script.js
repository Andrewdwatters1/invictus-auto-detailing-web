// ===== Gallery Carousel with Blur Effect =====
const carouselTrack = document.querySelector('.carousel-track');
const carouselItems = document.querySelectorAll('.carousel-item');
let carouselIndex = 0;

const updateCarousel = () => {

  carouselIndex++;

  // Calculate cumulative offset to center current item
  let offset = 0;

  for (let i = 0; i < carouselIndex; i++) {
    const itemWidth = carouselItems[i].offsetWidth;
    const halfOfNext = carouselItems[i + 1].offsetWidth / 2;
    offset += itemWidth + halfOfNext;
  }

  carouselTrack.scroll({
    top: 0,
    left: offset,
    behavior: "smooth",
  });

  // Apply blur to non-center slides
  carouselItems.forEach((item, index) => {
    if (index === carouselIndex) {
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
