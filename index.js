import { v4 as uuidv4 } from 'uuid';
import fetchIntercept from 'fetch-intercept';

const rrweb = require('rrweb');
const rrWebConfig = require('./config.json');

const addHeaders = (config) => {
  const sessionTokenString = sessionStorage.getItem('RetrospectSessionToken');
  const sessionToken = JSON.parse(sessionTokenString);

  config.headers['X-Session-Id'] = sessionToken.id;
  config.headers['X-Chapter-Id'] = sessionStorage.getItem('ChapterId');
  config.headers['X-User-Id'] = localStorage.getItem('UserId');
  config.headers['X-TriggerRoute'] = config.method + ' ' + config.url;
  config.headers['X-RequestData'] = JSON.stringify(config.data);
  sessionStorage.setItem('ChapterId', uuidv4());
  return config;
};

import('axios').then((axios) => {
  axios.interceptors.request.use(
    function (config) {
      return addHeaders(config);
    },
    function (error) {
      return Promise.reject(error);
    }
  );
});

fetchIntercept.register({
  request: function (url, patchConfig) {
    if (patchConfig.headers['X-Rrweb'] !== 'true') {
      patchConfig = addHeaders(patchConfig);
    } else {
      delete patchConfig.headers['X-Rrweb'];
    }
    return [url, patchConfig];
  },

  requestError: function (error) {
    // Called when an error occured during another 'request' interceptor call
    return Promise.reject(error);
  },

  response: function (response) {
    return response;
  },

  responseError: function (error) {
    return Promise.reject(error);
  },
});

const initRrweb = () => {
  rrweb.record({
    emit(event) {
      const defaultLog = console.log['__rrweb_original__']
        ? console.log['__rrweb_original__']
        : console.log;

      // event.type 2 means a full snapshot event
      // which is sent to a separate endpoint
      // because it's handled differently from other events
      let endpoint;
      if (event.type === 2) {
        endpoint = `${rrWebConfig.endpoint}/events/snapshots`;
      } else {
        endpoint = `${rrWebConfig.endpoint}/events`;
      }

      // add the X-Rrweb header so that the fetch interceptor
      // knows not to add extra span headers
      // the fetch interceptor also removes the X-Rrweb property
      // I think, ideally, we would use a single set of headers
      // so it could rely on the interceptors, but we are short
      // on time
      const sessionTokenString = sessionStorage.getItem('RetrospectSessionToken');
      const sessionToken = JSON.parse(sessionTokenString);

      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Session-ID': sessionToken.id,
          'User-ID': localStorage.getItem('UserId'),
          'Chapter-ID': sessionStorage.getItem('ChapterId'),
          'X-Rrweb': 'true',
        },
        body: JSON.stringify(event),
      });
    },
    sampling: rrWebConfig.sampling,
    recordLog: true,
    checkoutEveryNth: rrWebConfig.fullSnapshotEveryNthEvent,
  });
};

const resetSessionToken = () => {
  // session token expires after 30 minutes
  const expirationDate = new Date(new Date().getTime() + (60000 * 30));
  const token = {
    id: uuidv4(),
    expirationDate: expirationDate.toISOString(),
  }

  sessionStorage.setItem('RetrospectSessionToken', JSON.stringify(token));
}

const Recorder = {
  async init() {
    if (!sessionStorage.getItem('RetrospectSessionToken')) {
      resetSessionToken();
    }

    const RetrospectTokenString = sessionStorage.getItem('RetrospectSessionToken');
    const RetrospectToken = JSON.parse(RetrospectTokenString);
    const RetrospectTokenExpiration = new Date(RetrospectToken.expirationDate);

    if (RetrospectTokenExpiration < new Date()) {
      resetSessionToken();
    }

    if (!sessionStorage.getItem('ChapterId')) {
      sessionStorage.setItem('ChapterId', uuidv4());
    }

    if (!localStorage.getItem('UserId')) {
      localStorage.setItem('UserId', uuidv4());
    }

    initRrweb();
  },
};

export default Recorder;
