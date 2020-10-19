const express = require('express')
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const fileUpload = require('express-fileupload');
require('dotenv').config()

const app = express();
app.use(cors());
app.use(bodyParser.json())
app.use(fileUpload());
const port = process.env.PORT || 5000


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.9a5nl.mongodb.net/creativeAgency?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true,useUnifiedTopology: true  });
client.connect(err => {
  const ServiceCollection = client.db("creativeAgency").collection("services");
  const orderCollection = client.db("creativeAgency").collection("orders");
  const reviewCollection = client.db("creativeAgency").collection("reviews");
  const adminCollection = client.db("creativeAgency").collection("admin");

  //get all services 
  app.get("/getServices",(req,res)=>{
      ServiceCollection.find({})
      .toArray((err,documents)=>{
          res.send(documents)
      })
  })
// add service
  app.post('/addService', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const service = req.body.service;
    const description = req.body.description;
    const file = req.files.imgFile;
    const newImg = file.data;
    const conImg = newImg.toString('base64');
    const image = {
        contentType: req.files.imgFile.mimetype,
        size: req.files.imgFile.size,
        img: Buffer.from(conImg, 'base64')
    };
    ServiceCollection.insertOne({ name, email, image, service, description })
        .then(result => {
            res.send(result.insertedCount > 0)
        })
})
 // order
app.post('/addOrder', (req, res) => {
    const userName = req.body.name;
    const userEmail = req.body.email;
    const description = req.body.description;
    const serviceId = req.body.serviceId;
    const price = req.body.price;
    const serviceName = req.body.serviceName;
    const date = req.body.date;
    const file = req.files.image;
    const Img = file.data;

    const encImg = Img.toString('base64');

    const image = {
        contentType: req.files.image.mimetype,
        size: req.files.image.size,
        img: Buffer.from(encImg, 'base64')
    }
    orderCollection.insertOne({ userName, userEmail, description, serviceName, image, serviceId, price, date })
        .then(result => {
            res.send(result.insertedCount > 0)
        })
})
// get review
app.get("/getReviews",(req,res)=>{
    reviewCollection.find({})
    .toArray((err,documents)=>{
        res.send(documents)
    })
})

app.get('/getUserService',(req,res)=>{
    orderCollection.find({})
    .toArray((err,document)=>{
        res.send(document);
    })
})
app.post('/addAdmin',(req,res)=>{
    const email = req.body;
adminCollection.insertOne(email )
.then(result => {
    res.send(result.insertedCount > 0)    
})

})
app.post('/addReview', (req, res) => {
    const newReview = req.body;
    reviewCollection.insertOne(newReview)
        .then(result => {
            res.send(result.insertedCount > 0);
        })
})
app.get('/identifyAdmin', (req, res) => {
    adminCollection.find({ email: req.query.email })
        .toArray((err, document) => {
            res.status(200).send(document)
        })
})
  app.get('/showSpecifiedUserService', (req, res) => {
    orderCollection.find({ userEmail: req.query.email })
        .toArray((err, document) => {
            res.status(200).send(document)
        })
})
});



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port)