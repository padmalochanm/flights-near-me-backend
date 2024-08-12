import express from "express";
import cors from "cors";
import fs from "fs";
const app = express();
const PORT = 5000;

// Middleware to allow cross-origin requests
app.use(cors());
const airlinesData = JSON.parse(fs.readFileSync('AirlineFinal.json', 'utf8'));

// Route to fetch flights based on user coordinates
app.get('/api/flights', async (req, res) => {
  const { lamin, lamax, lomin, lomax } = req.query;
  const url = `https://opensky-network.org/api/states/all?lamin=${lamin}&lamax=${lamax}&lomin=${lomin}&lomax=${lomax}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data.states);
  } catch (error) {
    console.error("Error fetching flight data", error);
    res.status(500).json({ error: 'Error fetching flight data' });
  }
});

// Route to fetch aircraft details based on ICAO24 code
app.get('/api/aircraft/:icao24/:callsign', async (req, res) => {
  const { icao24, callsign } = req.params;
  const url = `https://opensky-network.org/api/metadata/aircraft/icao/${icao24}`;

  try {
    const response = await fetch(url);
    const aircraftData = await response.json();
    const airlineCode = callsign.substring(0, 3).toUpperCase();
    const airlineName = airlinesData[airlineCode];
    const responseData = {
      ...aircraftData,
      airline: airlineName || 'Airline not found'
    };

    res.json(responseData);
  } catch (error) {
    console.error("Error fetching aircraft details", error);
    res.status(500).json({ error: 'Error fetching aircraft details' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
