class Fetch {
  constructor({ baseUrl }) {
    this.baseUrl = baseUrl;
  }

  get(url, data) {
    this.ajax('GET', url, data);
  }

  post(url, data) {
    this.ajax('POST', url, data);
  }

  ajax(method, url, data = {}, async = true) {
    const xhr = new XMLHttpRequest();
    const realUrl = this.baseUrl ? this.baseUrl + url: url;
    const params = this._parseParams(method, data);
 
    return new Promise((resolve, reject) => {
      xhr.open(method, realUrl, async);
      xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');

      if(method === 'GET') {
        xhr.send(null);
      }

      if(method === 'POST') {
        xhr.send(params);
      }

      xhr.onreadystatechange = ()=> {
        if(xhr.readyState === 4 && xhr.status === 200) {
          resolve(JSON.parse(xhr.responseText));
        }
      };

      xhr.onerror = ()=> {
        reject('请求失败！');
      }

    });

  }

  _parseParams(method, data) {
    if(method === 'GET') {
      
    }
    if(method === 'POST') {
      return JSON.parse(data);
    }
    return data;
  }

}
