import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';

export default class ApiService {
  constructor() {
    this.q = '';
    this.page = 1;
  }

  fetchPictures() {
    return axios
      .get(`${BASE_URL}`, {
        params: {
          key: '39874943-ba671930c3dcb7d11922b6a96',
          q: this.q,
          image_type: 'photo',
          orientation: 'horizontal',
          safesearch: true,
          per_page: 40,
          page: this.page,
        },
      })
      .then(response => {
        this.page += 1;
        console.log(response.data.totalHits);

        return response.data;
      });
  }
  resetPage() {
    this.page = 1;
  }
  get query() {
    return this.q;
  }
  set query(newQuery) {
    this.q = newQuery;
  }
}
