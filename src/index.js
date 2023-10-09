import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import ApiService from './api-service.js';

const refs = {
  searchForm: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMore: document.querySelector('.load-more'),
};

const lightbox = new SimpleLightbox('.gallery a', {});
const apiService = new ApiService();
let lastItem;
let loaderHits = 40;
const scrollToTopBtn = document.getElementById('scrollToTopBtn');

scrollToTopBtn.addEventListener('click', scrollToTop);
window.addEventListener('scroll', toggleScrollToTopBtn);
refs.searchForm.addEventListener('submit', searchPictures);

const optionsForObserver = {
  root: null,
  rootMargin: '0px',
  threshold: 0.1,
};

const observer = new IntersectionObserver(onLoadMore, optionsForObserver);

async function onLoadMore(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      apiService.fetchPictures().then(data => {
        refs.gallery.insertAdjacentHTML('beforeend', hitsMarkup(data.hits));
        loaderHits += data.hits.length;
        if (loaderHits >= data.totalHits) {
          showErrorNotification();
        }
        lightbox.refresh();
        smoothScroll();
        lastItem = document.querySelector('.photo-card:last-child');
        observer.unobserve(entry.target);
        observer.observe(lastItem);
      });
    }
  });
}

async function searchPictures(e) {
  e.preventDefault();
  try {
    apiService.query = e.currentTarget.elements.searchQuery.value;
    apiService.resetPage();
    const data = await apiService.fetchPictures();
    if (data.hits[0] !== undefined && apiService.query.trim() !== '') {
      clearGallery();
      refs.gallery.insertAdjacentHTML('beforeend', hitsMarkup(data.hits));
      lightbox.refresh();
      newHitsNotification(data.totalHits);
      infiniteScroll();
    } else {
      throw new Error();
    }
  } catch (error) {
    clearGallery();
    showErrorNotification('true');
  }
}

function hitsMarkup(hits) {
  return hits
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
      <div class="photo-card">
      <a class = "link" href="${largeImageURL}">
  <img class ="small-img" src="${webformatURL}" alt="${tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes ${likes}</b>
    </p>
    <p class="info-item">
      <b>Views ${views}</b>
    </p>
    <p class="info-item">
      <b>Comments ${comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads ${downloads}</b>
    </p>
  </div>
  </a>
</div>`
    )
    .join('');
}

function showErrorNotification(msg) {
  if (msg === 'true') {
    msg =
      'Sorry, there are no images matching your search query. Please try again.';
  } else {
    msg = `We're sorry, but you've reached the end of search results.`;
  }
  Notiflix.Notify.failure(msg, {
    position: 'right-top',
    timeout: 5000,
  });
}

function newHitsNotification(totalHits) {
  Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`, {
    position: 'right-top',
    timeout: 5000,
  });
}

function clearGallery() {
  refs.gallery.innerHTML = '';
}

function smoothScroll() {
  const { height: cardHeight } =
    refs.gallery.firstElementChild.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  });
}

function toggleScrollToTopBtn() {
  if (window.scrollY > 300) {
    scrollToTopBtn.style.display = 'block';
  } else {
    scrollToTopBtn.style.display = 'none';
  }
}
function infiniteScroll() {
  lastItem = document.querySelector('.photo-card:last-child');
  observer.observe(lastItem);
}
