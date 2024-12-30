const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Sequelize, DataTypes } = require('sequelize');
const cors = require('cors');

const app = express();

// Enable CORS for all origins
app.use(cors());
const PORT = process.env.PORT || 5000;
const SECRET = 'the_secret_key';
// Middlewares
app.use(bodyParser.json());
require('dotenv').config();


// Database Connection
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false, // Important for cloud-hosted databases
    },
  },
});


// Define Models
const User = sequelize.define('User', {
  username: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
});

const Seat = sequelize.define('Seat', {
  row: { type: DataTypes.INTEGER, allowNull: false },
  seatNumber: { type: DataTypes.INTEGER, allowNull: false },
  isReserved: { type: DataTypes.BOOLEAN, defaultValue: false },
  reservedBy: { type: DataTypes.INTEGER, allowNull: true },
});

const populateSeats = async () => {
    try {
      const rows = 12; 
      const seatsPerRow = 7; 
      const seatsInLastRow = 3; 
  
      const seatPromises = [];
  
      // Populate seats
      for (let row = 1; row <= rows; row++) {
        const seatsInCurrentRow = row === rows ? seatsInLastRow : seatsPerRow;
  
        for (let seatNumber = 1; seatNumber <= seatsInCurrentRow; seatNumber++) {
          seatPromises.push(
            Seat.create({
              row,
              seatNumber,
              isReserved: false,
              reservedBy: null,
            })
          );
        }
      }
  
      // Wait for all seats to be created
      await Promise.all(seatPromises);
  
      console.log('Seats populated successfully');
    } catch (error) {
      console.error('Error populating seats:', error);
    }
  };

// populateSeats();
// Sync Models
sequelize.sync({ force: false }).then(() => console.log('Database synced'));

// Routes
// Signup
app.post('/api/signup', async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ username, password: hashedPassword });
    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(400).json({ error: 'User creation failed', details: error });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '1h' });
    res.status(200).json({ message: 'Login successful', token });
  } catch (error) {
    res.status(500).json({ error: 'Login failed', details: error });
  }
});

// Fetch Seat Availability
app.get('/api/seats', async (req, res) => {
  try {
    const seats = await Seat.findAll();
    res.status(200).json(seats);
  } catch (error) {
    res.status(500).json({ error: 'Could not fetch seats', details: error });
  }
});

app.post('/api/seats/reserve', async (req, res) => {
    try {
      const { userId, seatCount } = req.body;
  
      if (seatCount > 7) {
        return res.status(400).json({ error: 'You can only reserve up to 7 seats' });
      }
  
      let availableSeats = await Seat.findAll({
        where: { isReserved: false },
        order: [['row', 'ASC'], ['seatNumber', 'ASC']],
      });
  
      let seatsToReserve = [];
      let rowSeats = [];
      let currentRow = 0;
  
      for (let i = 0; i < availableSeats.length; i++) {
        const seat = availableSeats[i];
        
        if (seat.row !== currentRow) {
          if (rowSeats.length >= seatCount) {
            seatsToReserve = rowSeats.slice(0, seatCount);  
            break;
          }
          rowSeats = [seat];
          currentRow = seat.row;
        } else {
          rowSeats.push(seat);
        }
      }
  
      if (seatsToReserve.length < seatCount) {
        const remainingSeatsNeeded = seatCount - seatsToReserve.length;
        let adjacentSeats = [];
  
        for (let i = 0; i < availableSeats.length; i++) {
          if (availableSeats[i].isReserved) continue; // Skip reserved seats
          adjacentSeats.push(availableSeats[i]);
          if (adjacentSeats.length === remainingSeatsNeeded) {
            seatsToReserve = [...seatsToReserve, ...adjacentSeats];
            break;
          }
        }
      }
  
      // If we still don't have enough available seats
      if (seatsToReserve.length < seatCount) {
        return res.status(400).json({ error: 'Not enough available seats' });
      }
  
      // Reserve the seats
      const reservedSeats = seatsToReserve.map(seat =>
        seat.update({ isReserved: true, reservedBy: userId })
      );
      await Promise.all(reservedSeats);
  
      // Return the reserved seat numbers
      const reservedSeatNumbers = seatsToReserve.map(seat => `${seat.row}${seat.seatNumber}`);
      res.status(200).json({
        message: 'Seats reserved successfully',
        reservedSeats: reservedSeatNumbers,
      });
    } catch (error) {
      res.status(500).json({ error: 'Seat reservation failed', details: error });
    }
  });
  

// Cancel Reservation
app.post('/api/seats/cancel', async (req, res) => {
  try {
    const { userId } = req.body;
    const userSeats = await Seat.findAll({ where: { reservedBy: userId } });
    const seatUpdates = userSeats.map((seat) =>
      seat.update({ isReserved: false, reservedBy: null })
    );
    await Promise.all(seatUpdates);
    res.status(200).json({ message: 'Reservation cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Cancellation failed', details: error });
  }
});

// Get User ID by Username
app.post('/api/user-id', async (req, res) => {
    try {
      const { username } = req.body;
      
      // Find user by username
      const user = await User.findOne({ where: { username } });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Respond with the user ID
      res.status(200).json({ userId: user.id });
    } catch (error) {
      res.status(500).json({ error: 'Error fetching user ID', details: error });
    }
  });
  

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
