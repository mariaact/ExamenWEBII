const express = require('express');
const router = express.Router();
const dbo = require('../db/conn');
const ObjectId = require('mongodb').ObjectId;
const MAX_RESULTS = parseInt(process.env.MAX_RESULTS);
const COLLECTION = 'books';

//getBooks()
router.get('/', async (req, res) => {
  let limit = MAX_RESULTS;
  if (req.query.limit){
    limit = Math.min(parseInt(req.query.limit), MAX_RESULTS);
  }
  let next = req.query.next;
  let query = {}
  if (next){
    query = {_id: {$lt: new ObjectId(next)}}
  }
  const dbConnect = dbo.getDb();
  let results = await dbConnect
    .collection(COLLECTION)
    .find(query)
    .sort({_id: -1})
    .limit(limit)
    .toArray()
    .catch(err => res.status(400).send('Error searching for books'));


    console.log(results.length)
    var datos = [];
    var objeto = {};

    for (var i = 0; i < results.length; i++) {
  
      var nombre = results[i];
  
      datos.push({
        "id": nombre._id,
        "titulo": nombre.title,
        "author": nombre.author, 
        "link": 'http://localhost:3000/book/' + nombre._id
      });
    }
  
    objeto.datos = datos;
  
  next = results.length == limit ? results[results.length - 1]._id : null;
  res.json({datos, next}).status(200);
});

//getBookById()
router.get('/:id', async (req, res) => {
  const dbConnect = dbo.getDb();
  let query = {_id: new ObjectId(req.params.id)};
  let result = await dbConnect
    .collection(COLLECTION)
    .findOne(query);
  if (!result){
    res.send("Not found").status(404);
  } else {
    res.status(200).send(result);
  }
});

//addBook()
router.post('/', async (req, res) => {
  const dbConnect = dbo.getDb();
  console.log(req.body);
  let result = await dbConnect
    .collection(COLLECTION)
    .insertOne(req.body);
  res.status(201).send(result);
});

//deleteBookById()
router.delete('/:id', async (req, res) => {
  const query = { _id: new ObjectId(req.params.id) };
  const dbConnect = dbo.getDb();
  let result = await dbConnect
    .collection(COLLECTION)
    .deleteOne(query);
    if (!result) {
      res.status(404).json({ error: 'Libro no encontrado' });
    } else {
      res.status(200).json({ message: 'Libro borrado'});
    }
});

module.exports = router;
