require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const dns = require('dns');



// Basic Configuration
const port = process.env.PORT || 3000;

console.log(process.env.MONGO_URI)
app.use(cors());

//////////////////////////////////////////////////////////////////////////
let mongoose = require('mongoose');
let urlDatabase

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {console.log("connected to mongodb")})
.catch(() => {console.log("failed to connect .... ERROR")})

const urlSchema =  new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  short_url: Number
});

 urlDatabase = mongoose.model('urlDatabase', urlSchema);


app.use('/public', express.static(`${process.cwd()}/public`));

let bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


app.post('/api/shorturl', (req, res) => {
  const  url  =  req.body.url;




  if (url) {

  let parsedUrl;

  try {
    parsedUrl = new URL(url);
  } catch (e) {
    return res.json({ error: 'invalid url' });
  }

    // dns func
    let new_record;
    dns.lookup(parsedUrl.hostname, (err, address, family) => {
            if (err) {

              res.json({ error: 'invalid url' })
              return;
            } else {
          

               let randomNumber = Math.floor(Math.random() * 5000) + 1;

              ////////////////////////////////////////////////////////////////////////////////
             urlDatabase.findOne({ name: url })
  .then(data => {
    if (data) {
      // If the URL already exists, send the original and short URL as a JSON response
      
      res.json({ original_url: data.name, short_url: data.short_url });
    } else {
      // If no record is found, create a new one

      const new_record = new urlDatabase({ name: url, short_url: randomNumber });

      // Save the new record to the database
      new_record.save()
        .then(() => {
          console.log("Record saved");
          // Send the new record details as the JSON response
          res.json({ original_url: new_record.name, short_url: new_record.short_url });
        })
        .catch(() => {
          console.log("Failed to save record");
          res.status(500).json({ error: 'Failed to save the new record' });
        });
    }
  })
  .catch(error => {
    console.log("Error occurred while finding the URL", error);
    res.status(500).json({ error: 'Database error' });
  });


               

               }
    
            }
           
          );
  ///////////////////////////////////////////////////////////////////////////////

  } else {
    res.json({ error: 'invalid url' })
  }
})

app.get('/api/shorturl/:short_url', (req, res) => {
  let short_url = parseInt(req.params.short_url)
  urlDatabase.findOne({short_url: short_url}).then(data => {
    res.redirect(data.name)
    }
    ).catch(() => {
      res.json({ error: 'invalid url' })
    })
  })









app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
