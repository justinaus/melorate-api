const express = require('express')
// const proxy = require('express-http-proxy')
const cors = require('cors')

const queryString = require('query-string');
const axios = require("axios");
const cheerio = require("cheerio");

const app = express()
const port = 3000

app.use(cors())

// app.use('/naver', proxy('https://m.naver.com'))

app.get('/', (req, res) => {
  res.send('Hello World!')
})

const getHtml = async (url) => {
  try {
    return await axios.get(url);
  } catch (error) {
    console.error(error);
    return error;
  }
};

const parseAlbumList = (data) => {
  const $ = cheerio.load(data);
  
  const $list = $("#albumList .service_list_album > ul> li");

  if(!$list) {
    return [];
  }

  // jquery 유사 배열? 객체를 array로.
  const ret = $list.toArray().map((item) => {
    const entry = $(item).children('.entry');
    const info = $(entry).children('.info');

    return {
      title: $(info).children('a').text()
    }
  });

  return ret;
}

app.get('/api/genre/albumList', async (req, res) => {
  const stringified = queryString.stringify(req.query);

  let url = 'https://www.melon.com/genre/album_list.htm';
  if(stringified) {
    url += `?${stringified}`;
  }

  const html = await getHtml(url);

  if(html.isAxiosError) {
    return res.json({
      status: html.response.status,
      statusText: html.response.statusText,
    });
  }

  return res.send({
    status: 200,
    data: parseAlbumList(html.data),
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})