const express = require('express');
const cors = require('cors');
require('dotenv').config()
const jwt = require('jsonwebtoken');
const morgan = require('morgan')



const app = express()
const port = process.env.PORT || 3000
app.use(express.json())
app.use(morgan('dev'))

app.use(cors())




const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_user}:${process.env.DB_pass}@cluster0.331jm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {

    const db = client.db("user-DB")
    const usersCollection = db.collection("users")

    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_Token, {
        expiresIn: '20h'
      })
      // console.log(token)
      res.send({ token })
    })
   //verifyToken midddleware
   const verifyToken = (req, res, next) => {
    // console.log('inside verifyToken ', req.headers.authorization)
    if (!req.headers.authorization) {
      return res.send(401).send({ message: 'unAuthorized access' })
    }
    const token = req.headers.authorization.split(' ')[1]
    console.log(token);

    jwt.verify(token, process.env.ACCESS_Token, (err, decoded) => {
      if (err) {
        return res.status(401).send({ message: 'unAuthorized access' })
      }
      req.decoded = decoded;
      next()
    })
  }

    app.get("/users", async(req,res)=>{
        const result = await usersCollection.find().toArray()
        res.send(result)
    })
    app.post("/users", async(req,res)=>{
      const query = req.body;
      const result = await usersCollection.insertOne(query)
      res.send(result)
    })

    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {

  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('server is running')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})