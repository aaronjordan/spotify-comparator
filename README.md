# Spotify - Comparator
A project to analyze a user's music listening habits and compare theirs to friends.

## Current Progress
The app currently consists of a user authentication flow built in modern Node.js. [The example given by Spotify](https://github.com/spotify/web-api-auth-examples) is used as a model but updated to replace the deprecated Request library with Axios and [revise Buffer initialization](https://nodejs.org/en/docs/guides/buffer-constructor-deprecation/).

Currently, there are three endpoints: 
* /login (through the button on the site's index) will trigger the OAuth request to Spotify. 
* /check endpoint can be visited to check a user's login status. 
* /logout endpoint can be used to log out a user.