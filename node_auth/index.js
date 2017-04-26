'use strict';
const express = require('express');
const simpleOauthModule = require('./../');
var Client = require('node-rest-client').Client;
const app = express();
var client = new Client();

let access_token = '';
const key = '';
const ts = '';
const username = '';

const oauth2 = simpleOauthModule.create({
  client: {
    id: '<client_id>',
    secret: '<client_secret>',
  },
  auth: {
    tokenHost: 'http://localhost:8000',
    tokenPath: '/o/token/',
    authorizePath: '/o/authorize/'
  },
});

// Authorization uri definition
const authorizationUri = oauth2.authorizationCode.authorizeURL({
  redirect_uri: 'http://localhost:3000/callback',
/*  scope: 'notifications',*/
  state:'random_state_string',
});

// Initial page redirecting to Github
app.get('/auth', (req, res) => {
  console.log(authorizationUri);
  res.redirect(authorizationUri);
});

// Callback service parsing the authorization token and asking for the access token
app.get('/callback', (req, res) => {
  console.log("request: " + req.query.code)
  const code = req.query.code;
  const redirect_uri = 'http://localhost:3000/callback';
  const options = {
    code,
    redirect_uri
  };

  oauth2.authorizationCode.getToken(options, (error, result) => {
    console.log(error);
    console.log(result);
    if (error) {
      console.error('Access Token Error', error.message);
      return res.json('Authentication failed');
    }

    console.log('The resulting token: ', result);
    access_token = result.access_token;
    let token = oauth2.accessToken.create(result);

    return res
      .status(200)
      .json(token);
  });
});


app.get('/api/user/account', (req, res) => {

var args = {
    data: {
      key: key,
      ts:ts,
      username: username
    },
    headers: { "Content-Type": "application/json", 'Authorization' : 'Bearer ' + access_token }
};

client.post("http://localhost:8000/api/user/account", args, function (data, response) {
    // parsed response body as js object
    console.log(access_token);
    console.log(args.headers);
    res.send(data);
});

});

app.get('/', (req, res) => {
  res.send('Hello<br><a href="/auth">Log in with Github</a>');
});

app.listen(3000, () => {
  console.log('Express server started on port 3000'); // eslint-disable-line
});
