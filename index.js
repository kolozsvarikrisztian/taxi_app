const express = require("express");
const app = express();
const ObjectId = require("mongodb").ObjectId;

function getClient() {
  const { MongoClient, ServerApiVersion } = require('mongodb');
  const uri = "mongodb+srv://testUser:a0BM47G47PeyPuZR@cluster0.km0w9wk.mongodb.net/?retryWrites=true&w=majority";
  return new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
}

const path = require("path");
app.use(express.static('public'));

app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, 'views', 'home.html'))
})




app.get('/cars', function (req, res) {
  const client = getClient();
  client.connect(async err => {
    const collection = client.db("taxi_app").collection("cars");
    // perform actions on the collection object
    // licenseNumber === 'ABC-123'
    const cars = await collection.find({name: {$eq: ['Rover 45', 'SAAB 2000']}})
    .toArray();    
    res.send(cars)

    client.close();
  });  
})

function getId(raw) {
  try {
    return new ObjectId(raw);
  } catch (error) {
    return "";
  }
}

app.get('/cars/:id', function(req, res) {
  const id =  getId(req.params.id);
  if (!id) {
    res.send({error: "Invalid id"});
    return;
  }
  const client = getClient();
  client.connect(async err => {
    const collection = client.db("taxi_app").collection("cars");
    // perform actions on the collection object
    const car = await collection.findOne({_id: id});    
    if (!car) {
      res.send({error: "not found"});
      return;
    }   
    res.send(car)

    client.close();
  });  
});



app.delete('/cars/:id', function(req, res) {
  const id =  getId(req.params.id);
  if (!id) {
    res.send({error: "Invalid id"});
    return;
  }
  const client = getClient();
  client.connect(async err => {
    const collection = client.db("taxi_app").collection("cars");
    // perform actions on the collection object
    const result = await collection.deleteOne({_id: id});    
    if (!result.deletedCount) {
      res.send({error: "not found"});
      return;
    }   
    res.send({id:req.params.id})

    client.close();
  });  
});

const bodyParser = require('body-parser');

app.put('/cars/:id', bodyParser.json(), function(req, res) {
  const updatedCar = {
    name: req.body.name,
    licenseNumber: req.body.licenseNumber,
    hourlyRate: req.body.hourlyRate,
  };
  const id =  getId(req.params.id);
  if (!id) {
    res.send({error: "Invalid id"});
    return;
  }
  const client = getClient();
  client.connect(async err => {
    const collection = client.db("taxi_app").collection("cars");
    // perform actions on the collection object
    const result = await collection.findOneAndUpdate({_id: id}, {$set: updatedCar}, {returnDocument: "after"});   
    console.log(result) 
    if (!result.ok) {
      res.send({error: "not found"});
      return;
    }   
    res.send(result.value)

    client.close();
  });  
});

app.post('/cars', bodyParser.json(), function(req, res) {
  const newCar = {
    name: req.body.name,
    licenseNumber: req.body.licenseNumber,
    hourlyRate: req.body.hourlyRate,
    trips: []
  };
  
  const client = getClient();
  client.connect(async err => {
    const collection = client.db("taxi_app").collection("cars");
    // perform actions on the collection object
    const result = await collection.insertOne(newCar);    
    if (!result.insertedId) {
      res.send({error: "insert error"});
      return;
    }   
    res.send(newCar)

    client.close();
  });  
});

app.post('/trips', bodyParser.json(), function(req, res) {
  const newTrip = {
    numberOfMinutes: req.body.numberOfMinutes,
    date: Date.now() / 1000
  };
  const id =  getId(req.body.carId);
  if (!id) {
    res.send({error: "Invalid id"});
    return;
  }
  const client = getClient();
  client.connect(async err => {
    const collection = client.db("taxi_app").collection("cars");
    // perform actions on the collection object
    const result = await collection.findOneAndUpdate({_id: id}, {$push: {trips: newTrip}}, {returnDocument: "after"});   
    console.log(result) 
    if (!result.ok) {
      res.send({error: "not found"});
      return;
    }   
    res.send(result.value)

    client.close();
  });  
});

app.listen(3000);
