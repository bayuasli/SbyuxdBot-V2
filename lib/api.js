/**
 * Copyright (c) 2025 PurrBits
 * This project is PUBLIC and part of the Bot Project:
 * https://github.com/purrbits
 */

import util from "util";
import Func from './function.js';

const APIs = {
  brat: {
    baseURL: "https://purrbits-brat.hf.space",
  },
  purr: {
    baseURL: "https://purrbits.lick.eu.org",
  },
};

function createUrl(apiNameOrURL, endpoint, params = {}, apiKeyParamName) {
  try {
    const api = APIs[apiNameOrURL];

    let baseURL;
    if (api) {
      baseURL = api.baseURL;
    } else {
      const url = new URL(apiNameOrURL);
      baseURL = url.origin;
    }

    const queryParams = new URLSearchParams(params);

    if (apiKeyParamName && api && "APIKey" in api) {
      queryParams.set(apiKeyParamName, api.APIKey);
    }

    const apiUrl = new URL(endpoint, baseURL);
    apiUrl.search = queryParams.toString();

    return apiUrl.toString();
  } catch (error) {
    console.error(`Error: ${util.format(error)}`);
    return null;
  }
}

async function request(apiNameOrURL, endpoint, params = {}, apiKeyParamName) {
    try {
        const Url = createUrl(apiNameOrURL, endpoint, params, apiKeyParamName);
        const res = await Func.fetchJson(Url)
        return res
    } catch (err) {
        return null
    }
}

function listUrl() {
  return APIs;
}

export default { createUrl, request, listUrl };