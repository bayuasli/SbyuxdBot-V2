import axios from 'axios';

export async function pinterestSearch(query, cookie, csrftoken) {
  const defaultCookie = '_pinterest_sess=...; csrftoken=...';
  const defaultCsrftoken = '...';

  const randomSuffix = Math.floor(Math.random() * 10000);
  const modifiedQuery = `${query} ${randomSuffix}`;

  const userAgents = [
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Mobile Safari/537.36',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
  ];
  const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

  const randomPageSize = Math.floor(Math.random() * 30) + 20;

  const url = 'https://id.pinterest.com/resource/BaseSearchResource/get/';
  const headers = {
    'accept': 'application/json, text/javascript, */*, q=0.01',
    'accept-language': 'id-ID',
    'content-type': 'application/x-www-form-urlencoded',
    'cookie': cookie || defaultCookie,
    'origin': 'https://id.pinterest.com',
    'referer': `https://id.pinterest.com/search/pins/?q=${encodeURIComponent(modifiedQuery)}&rs=typed`,
    'user-agent': randomUserAgent,
    'x-csrftoken': csrftoken || defaultCsrftoken,
    'x-pinterest-appstate': 'active',
    'x-pinterest-source-url': `/search/pins/?q=${encodeURIComponent(modifiedQuery)}&rs=typed`,
    'x-requested-with': 'XMLHttpRequest',
  };

  const data = new URLSearchParams();
  data.append('source_url', `/search/pins/?q=${encodeURIComponent(modifiedQuery)}&rs=typed`);
  data.append('data', JSON.stringify({
    options: {
      query: modifiedQuery,
      scope: 'pins',
      page_size: randomPageSize,
      appliedProductFilters: '---',
      domains: null,
      user: null,
      seoDrawerEnabled: false,
      applied_unified_filters: null,
      auto_correction_disabled: false,
      journey_depth: null,
      source_id: null,
      source_module_id: null,
      source_url: `/search/pins/?q=${encodeURIComponent(modifiedQuery)}&rs=typed`,
      static_feed: false,
      selected_one_bar_modules: null,
      query_pin_sigs: null,
      price_max: null,
      price_min: null,
      request_params: null,
      top_pin_ids: null,
      article: null,
      corpus: null,
      customized_rerank_type: null,
      filters: null,
      rs: 'typed',
      redux_normalize_feed: true,
      bookmarks: [],
    },
    context: {},
  }));

  try {
    const response = await axios.post(url, data, { headers });
    const results = response.data?.resource_response?.data?.results || [];

    const shuffledResults = [...results].sort(() => Math.random() - 0.5);

    return shuffledResults.map((pin) => ({
      id: pin.id,
      title: pin.grid_title,
      description: pin.description,
      imageUrl: pin.images['736x']?.url || pin.images['474x']?.url,
      videoUrl: pin.story_pin_data?.pages?.[0]?.blocks?.[0]?.video?.video_list?.V_HLSV3_MOBILE?.url || "gak ada",
      pinner: pin.pinner?.full_name,
      pinnerUsername: pin.pinner?.username,
      boardName: pin.board?.name,
      boardUrl: pin.board?.url,
    }));
  } catch (error) {
    console.error('Error Pinterest:', error.message);
    return [];
  }
}