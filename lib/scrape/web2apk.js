import axios from 'axios';

class web2apk {
  constructor() {
    this.baseURL = 'https://standalone-app-api.appmaker.xyz';
  }

  async startBuild(url, email) {
    try {
      const res = await axios.post(`${this.baseURL}/webapp/build`, { url, email });
      return res.data?.body?.appId;
    } catch (err) {
      throw new Error('Build gagal: ' + err.message);
    }
  }

  async buildConfig(url, appID, appName) {
    try {
      const logo = 'https://logo.clearbit.com/' + url.replace(/^https?:\/\//, '');
      const config = {
        appId: appID,
        appIcon: logo,
        appName: appName,
        isPaymentInProgress: false,
        enableShowToolBar: false,
        toolbarColor: '#03A9F4',
        toolbarTitleColor: '#FFFFFF',
        splashIcon: logo
      };
      const res = await axios.post(`${this.baseURL}/webapp/build/build`, config);
      return res.data;
    } catch (err) {
      throw new Error('Build Config gagal: ' + err.message);
    }
  }

  async getStatus(appID) {
    try {
      while (true) {
        const res = await axios.get(`${this.baseURL}/webapp/build/status?appId=${appID}`)
        if (res.data?.body?.status === 'success') {
          return true;
        }
        await this.delay(5000)
      }
    } catch (err) {
      throw new Error('Gagal cek status: ' + err.message);
    }
  }

  async getDownload(appID) {
    try {
      const res = await axios.get(`${this.baseURL}/webapp/complete/download?appId=${appID}`)
      return res.data;
    } catch (err) {
      throw new Error('Gagal mengambil link download: ' + err.message);
    }
  }

  async build(url, email, appName) {
    try {
      const appID = await this.startBuild(url, email);
      await this.buildConfig(url, appID, appName);
      await this.getStatus(appID);
      const link = await this.getDownload(appID);
      return link;
    } catch (err) {
      console.error(err.message);
    }
  }

  async delay(ms) {
    return new Promise(res => setTimeout(res, ms));
  }
}

export default web2apk