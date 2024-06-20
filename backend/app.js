const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const { StockOption } = require('./models/stockOption');
const { OptionStrategy } = require('./models/optionStrategy');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const API_KEY = process.env.API_KEY;
const BASE_URL = process.env.BASE_URL;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

app.get('/api/stock/:ticker', async (req, res) => {
    const { ticker } = req.params;
    const url = `${BASE_URL}/v1/open-close/${ticker}/2023-01-09?adjusted=true&apiKey=${API_KEY}`;
    try {
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching stock data:', error);
        res.status(500).send('Failed to fetch data');
    }
});

app.get('/api/options-chain/:ticker', async (req, res) => {
    const { ticker } = req.params;
    const urlCalls = `${BASE_URL}/v3/snapshot/options/${ticker}?contract_type=call&apiKey=${API_KEY}`;
    const urlPuts = `${BASE_URL}/v3/snapshot/options/${ticker}?contract_type=put&apiKey=${API_KEY}`;

    try {
        const callsResponse = await axios.get(urlCalls);
        const callsData = callsResponse.data;

        const putsResponse = await axios.get(urlPuts);
        const putsData = putsResponse.data;

        const aggregatedData = {
            calls: callsData.results,
            puts: putsData.results
        };
        console.log(aggregatedData)
        res.json(aggregatedData);
    } catch (error) {
        console.error('Error fetching options chain:', error);
        res.status(500).send('Failed to fetch options chain');
    }
});

app.post('/api/options', async (req, res) => {
    try {
        const { symbol } = req.body;
        const newOption = new StockOption({ symbol });
        await newOption.save();
        res.status(201).json(newOption);
    } catch (error) {
        console.error('Error saving stock option:', error);
        res.status(400).json({ error: 'Could not save stock option' });
    }
});

app.get('/api/options', async (req, res) => {
    try {
        const options = await StockOption.find();
        res.json(options);
    } catch (error) {
        res.status(500).json({ error: 'Could not fetch options' });
    }
});

app.delete('/api/options/:id', async (req, res) => {
    try {
        await StockOption.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Could not delete option' });
    }
});

app.post('/api/strategies', async (req, res) => {
    try {
        const { name, options } = req.body;
        const newStrategy = new OptionStrategy({ name, options });
        await newStrategy.save();
        res.status(201).json(newStrategy);
    } catch (error) {
        console.error('Error creating new strategy:', error);
        res.status(400).json({ error: 'Could not create strategy' });
    }
});

app.post('/api/strategies/:id/options', async (req, res) => {
    const { id } = req.params;
    const optionData = req.body;
    try {
        const strategy = await OptionStrategy.findById(id);
        strategy.options.push(optionData);
        await strategy.save();
        res.status(200).json(strategy);
    } catch (error) {
        console.error('Error adding option to strategy:', error);
        res.status(400).json({ error: 'Could not add option to strategy' });
    }
});

app.get('/api/strategies', async (req, res) => {
    try {
        const strategies = await OptionStrategy.find();
        res.json(strategies);
    } catch (error) {
        console.error('Error fetching strategies:', error);
        res.status(500).json({ error: 'Could not fetch strategies' });
    }
});

app.get('/api/strategies/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const strategy = await OptionStrategy.findById(id);
        if (!strategy) {
            return res.status(404).send('Strategy not found');
        }
        res.json(strategy);
    } catch (error) {
        console.error('Error fetching strategy:', error);
        res.status(500).json({ error: 'Could not fetch strategy' });
    }
});

app.put('/api/strategies/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const strategy = await OptionStrategy.findByIdAndUpdate(id, updates, { new: true });
        res.json(strategy);
    } catch (error) {
        console.error('Error updating strategy:', error);
        res.status(400).json({ error: 'Could not update strategy' });
    }
});

app.delete('/api/strategies/:id', async (req, res) => {
    try {
        await OptionStrategy.findByIdAndDelete(req.params.id);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting strategy:', error);
        res.status(500).json({ error: 'Could not delete strategy' });
    }
});

app.delete('/api/strategies/:strategyId/options/:optionId', async (req, res) => {
    try {
        const { strategyId, optionId } = req.params;
        const strategy = await OptionStrategy.findById(strategyId);
        if (!strategy) {
            return res.status(404).send('Strategy not found');
        }
        strategy.options = strategy.options.filter(option => option._id.toString() !== optionId);
        await strategy.save();
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting option from strategy:', error);
        res.status(500).json({ error: 'Could not delete option from strategy' });
    }
});

app.put('/api/strategies/:id', async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
        const strategy = await OptionStrategy.findByIdAndUpdate(id, updates, { new: true });
        res.json(strategy);
    } catch (error) {
        console.error('Error updating strategy:', error);
        res.status(400).json({ error: 'Could not update strategy' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
