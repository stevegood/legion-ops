const auth0URL = "dev-i-uenm-b.auth0.com"

const auth = {
  v1: {
    domain: auth0URL,
    clientID: 'lD7NO1LrFyHlaMY0oHQoCb7s6MblhVrl',
    audience: `https://${auth0URL}/userinfo`
  },
  dev: {
    redirectUri: 'http://localhost:3000/callback',
    returnTo: 'http://localhost:3000'
  },
  prod: {
    redirectUri: 'https://legion-ops.com/callback',
    returnTo: 'https://legion-ops.com'
  }
};

export default auth;
