const https = require('https');
const express = require('express');
const ejs = require('ejs');
const path = require('path');

const app = express();

app.set('view engine', 'ejs');

// Add this middleware before your route handlers
app.use(express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));

app.get('/pay', (req, res) => {
  // Retrieve the total price from the query parameter
  const totalPrice = req.query.totalPrice || 0;

  // Render the pay.ejs view and pass the total price as a variable
  res.render('pay', { totalPrice });
});

app.get('/', (req, res) => {
  const consumerKey = 'ck_0a1d0af37fc58d63e8925d487fa92f3c17e93726';
  const consumerSecret = 'cs_54f05f6e23f158b1abde94968fb3a2d40aeb7ba7';
  const base64EncodedCredentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  const options = {
    hostname: 'aveluxecosmetics.com',
    port: 443, // or 443 for HTTPS
    path: '/wp-json/wc/v3/products/?per_page=100',
    method: 'GET',
    headers: {
      'Authorization': `Basic ${base64EncodedCredentials}`,
      'Content-Type': 'application/json'
    }
  };

  const request = https.request(options, response => {
    let data = '';

    response.on('data', chunk => {
      data += chunk;
    });

    response.on('end', () => {
      if (response.statusCode === 200) {
        const products = JSON.parse(data);
        // console.log(products)
        res.render('index', { products }); // Render the index.ejs template with the products data
      } else {
        res.status(response.statusCode).send(`Request failed with status code ${response.statusCode}`);
      }
    });
  });

  request.on('error', error => {
    console.error('Request error:', error);
    res.status(500).send('Internal server error');
  });

  request.end();
});

const port = 3000;
app.listen(process.env.PORT || port, () => {
  console.log(`Server is running on port ${port}`);
});