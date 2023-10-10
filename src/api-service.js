import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';

export default class ApiService {
  constructor() {
    this.q = '';
    this.pageIndex = 1;
    this.perPage = 40;
  }

  async fetchPictures() {
    try {
      const response = await axios.get(BASE_URL, {
        params: {
          key: '39874943-ba671930c3dcb7d11922b6a96',
          q: this.q,
          image_type: 'photo',
          orientation: 'horizontal',
          safesearch: true,
          per_page: this.perPage,
          page: this.pageIndex,
        },
      });
      console.log();
      this.pageIndex += 1;
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  resetPage() {
    this.pageIndex = 1;
  }
  get query() {
    return this.q;
  }
  set query(newQuery) {
    this.q = newQuery;
  }
}
