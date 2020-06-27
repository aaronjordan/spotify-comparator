/**
 * An example node.js Spotify authenticator
 */

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const queryString = require('querystring');
require('dotenv').config();

/**
 * Generates a random string containing numbers and letters
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = function(length) {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
};

const PORT = 1337;
const stateKey = 'spotify_auth_state';
const client_id = process.env.SERVER_PUB; // Your client id
const client_secret = process.env.SERVER_PRV; // Your secret
const redirect_uri = `http://localhost:${PORT}/callback`; // Your redirect uri

const app = express();
app.use(express.static(__dirname + '/public'))
   .use(cors())
   .use(cookieParser());

app.get('/login', (req, res) => {

  const state = generateRandomString(16);
  res.cookie(stateKey, state);

  // request authorization from Spotify
  const scope = 'playlist-read-collaborative playlist-read-private user-top-read'
  res.redirect('https://accounts.spotify.com/authorize?'+
    queryString.stringify({
      response_type: 'code',
      client_id,
      scope,
      redirect_uri,
      state
    }));
});

app.get('/callback', (req, res) => {

  // requests refresh and access tokens
  // after checking state parameter

  const code = req.query.code || null;
  const state = req.query.state || null;
  const storedState = req.cookies ? req.cookies[stateKey] : null;

  if (state === null || state !== storedState) {
    res.redirect('/#' +
      queryString.stringify({
        error: 'state_mismatch'
      }));
  } else {
    res.clearCookie(stateKey);
    const authOptions = {
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: queryString.stringify({
        code,
        redirect_uri,
        grant_type: 'authorization_code'
      }),
      headers: {
        'Authorization':'Basic ' + (Buffer.from(`${client_id}:${client_secret}`).toString('base64'))
      }
    };

    axios(authOptions)
      .then( a_res => {
        const { access_token, refresh_token } = a_res.data;
        
        // FIXME remove the test below and add different action -> set cookie
        // use the access token to access the Spotify Web API
        // let options = {
        //   method: 'get',
        //   url: 'https://api.spotify.com/v1/me',
        //   headers: { 'Authorization': 'Bearer ' + access_token }
        // };
        // axios(options)
        //   .then(response => {
        //     console.log(response.data);
        //     res.redirect(
        //       '/#' + queryString.stringify({ access_token, refresh_token })
        //     );
        //   }).catch(e => {
        //     console.log(e);
        //   });
        
        //////// SET COOKIE /////////
        // auth is good for just under one hour
        res.cookie('spotify_token_access', access_token, {maxAge: 3500000});
        res.send('Cookie was set!');

      }).catch( e => {
        if (e.response) {
          // response code outside 2xx
          console.log(e.response);
          res.redirect('/')
        } else if (e.request) {
          // no response received
          console.log(e.request);
        } else {
          // check unexpected error
          console.log('Error: ' + e.message)
        }
        console.log(e.config);
      });
  }
})

app.get('/logout', (req, res) => {
  res.clearCookie('spotify_token_access');
  res.send('logged out the user')
});

app.get('/check', (req, res) => {
  const auth = req.cookies.spotify_token_access;
  (auth) ? res.send(`logged in as ${auth}`) : res.send('logged out currently');
});

app.listen(PORT, () => {
  console.log(`Listening on PORT ${PORT}`)
});
