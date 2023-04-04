const fetch = require('isomorphic-unfetch')
const {getData} = require("spotify-url-info")(fetch)
require("dotenv").config()

getData("https://open.spotify.com/track/7xrC5Tcw7ZsR060M4KpwRw?si=650019c9ab254ad5").then(console.log).catch(console.error)