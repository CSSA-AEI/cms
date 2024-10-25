const express = require('express');
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require('@aws-sdk/lib-storage');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const multer = require('multer');
const bodyParser = require('body-parser');
const sharp = require('sharp');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

require('dotenv').config()
const app = express();

const uri = process.env.MONGO_URI;
const dbName = 'admin';

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKey = process.env.ACCESS_KEY;
const secretKey = process.env.SECRET_KEY;

const s3 = new S3Client({
  credentials:{
    accessKeyId: accessKey,
    secretAccessKey: secretKey
  },
  region: bucketRegion
})

app.use(cors());
app.use(bodyParser.json());

// Set up multer for handling file uploads
const storage = multer.memoryStorage(); // Store file in memory before uploading to S3
const upload = multer({ storage });

app.get('/events', async (req, res) => {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  
  try {
    await client.connect();
    const db = client.db(dbName);
    const eventsCollection = db.collection('CSSA-CMS');

    const upcomingEvents = await eventsCollection
      .find({ date: { $gte: new Date() } }) // Ensure only future events are considered
      .sort({ date: 1 }) // Sort by date in ascending order
      .limit(5) // Limit to five results
      .toArray();

    for(const event of upcomingEvents) {
      const getParameters = {
        Bucket: bucketName,
        Key: event.eventKey,
      };
      const imageUrl = await getSignedUrl(s3, new GetObjectCommand(getParameters), { expiresIn: 3600 }); //get the url of the image being hosted in the aws s3 bucket.
      event.posterUrl = imageUrl;
    }

    res.json(upcomingEvents); // Respond with the inserted event
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close(); // Ensure the MongoDB client is closed
  }
  
})

// POST route to handle event creation and store data in MongoDB, including image
app.post('/events', upload.single('poster'), async (req, res) => {
  const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await client.connect();
    const db = client.db(dbName);
    const eventsCollection = db.collection('CSSA-CMS');

    const dayOfUpload = new Date();
    const webpBuffer = await sharp(req.file.buffer)
      .resize({height: 1080, width: 1080, fit: "contain"})
      .webp({ quality: 80 })
      .toBuffer();

    const s3Key = `${req.body.name}_${dayOfUpload.getDate()}_${dayOfUpload.getMonth() + 1}_${dayOfUpload.getFullYear()}.webp`;
    
    const putParameters = {
      Bucket: bucketName,
      Key: s3Key, //originalname is the name of the image
      Body: webpBuffer,
      ContentType: 'image/webp' //the images are saved in .webp format
    }//Stuff we're putting into the S3Bucket

    const putCommand = new PutObjectCommand(putParameters);
    await s3.send(putCommand)

    const getParameters = {
      Bucket: bucketName,
      Key: s3Key,
    };
    const imageUrl = await getSignedUrl(s3, new GetObjectCommand(getParameters), { expiresIn: 3600 }); //get the url of the image being hosted in the aws s3 bucket.

    const newEvent = {
        name: req.body.name,
        date: new Date(req.body.date), 
        eventKey: s3Key,
        location: req.body.location,
        language: req.body.language,
        posterUrl: imageUrl,
    };

    const result = await eventsCollection.insertOne(newEvent);
    res.json(result); // Respond with the inserted event
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await client.close(); // Ensure the MongoDB client is closed
  }
});

// Server setup
const PORT = 3002;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
