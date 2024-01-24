const express = require('express')
const app = express()
const dotenv = require('dotenv');
const mongoose = require('mongoose')
// const port = 3000

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

dotenv.config()
mongoose.connect(process.env.MONGO_URL).then(()=> console.log("db connected")).catch((err) => console.log(err))

app.get('/', (req, res) => res.send('Hello Cherry!'))

app.listen(process.env.PORT||port, () => console.log(`Example app listening on port ${process.env.PORT}!`))

//new code

app.use(bodyParser.json());


const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//Define user schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

// Register endpoint
app.post('/register', async (req, res) => {
  try {
    console.log(req.body);
    const { username, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save the user to the database
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user in the database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate and send JWT token
    const token = jwt.sign({ username: user.username }, 'LKSDJF23SDF');
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

