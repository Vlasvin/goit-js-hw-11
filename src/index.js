import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import Notiflix from 'notiflix';
import ApiService from './api-service.js';

const lightbox = new SimpleLightbox('.gallery a', {});
const apiService = new ApiService();
let loaderHits = 40;

// let elem = document.querySelector('.container');
// let infScroll = new InfiniteScroll(elem, {
//   path: '.pagination__next',
//   append: '.post',
//   history: false,
// });

const refs = {
  searchForm: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  loadMore: document.querySelector('.load-more'),
};

refs.searchForm.addEventListener('submit', searchPictures);
refs.loadMore.addEventListener('click', onLoadMore);
// console.log(refs.searchForm);

function searchPictures(e) {
  e.preventDefault();
  apiService.query = e.currentTarget.elements.searchQuery.value;
  apiService.resetPage();
  apiService
    .fetchPictures()
    .then(data => {
      //   console.log(apiService.query);
      if (data.hits[0] !== undefined && apiService.query.trim() !== '') {
        clearGallery();
        refs.gallery.insertAdjacentHTML('beforeend', hitsMarkup(data.hits));
        lightbox.refresh();
        newHitsNotification(data.totalHits);
      } else {
        throw new Error();
      }
    })
    .catch(error => {
      clearGallery();
      showErrorNotification('true');
    });
}
function onLoadMore() {
  apiService.fetchPictures().then(data => {
    refs.gallery.insertAdjacentHTML('beforeend', hitsMarkup(data.hits));
    loaderHits += data.hits.length;
    if (loaderHits >= data.totalHits) {
      showErrorNotification();
    }
    lightbox.refresh();
    smoothScroll();
  });
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
