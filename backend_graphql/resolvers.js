const axios = require('axios');
const { StockOption } = require('./models/stockOption');
const { OptionStrategy } = require('./models/optionStrategy');

const API_KEY = 'sSQ_kehVK7ps6IyWXuXa7RW8lrvPW4S0';
const BASE_URL = 'https://api.polygon.io';

const resolvers = {
  Query: {
    getStockData: async (_, { ticker }) => {
      const url = `${BASE_URL}/v1/open-close/${ticker}/2023-01-09?adjusted=true&apiKey=${API_KEY}`;
      const response = await axios.get(url);
      return response.data;
    },
    getOptionsChain: async (_, { ticker }) => {
      const urlCalls = `${BASE_URL}/v3/snapshot/options/${ticker}?contract_type=call&apiKey=${API_KEY}`;
      const urlPuts = `${BASE_URL}/v3/snapshot/options/${ticker}?contract_type=put&apiKey=${API_KEY}`;
      const callsResponse = await axios.get(urlCalls);
      const putsResponse = await axios.get(urlPuts);
      return [...callsResponse.data.results, ...putsResponse.data.results];
    },
    getStockOptions: () => StockOption.find(),
    getOptionStrategies: () => OptionStrategy.find(),
    getOptionStrategy: (_, { id }) => OptionStrategy.findById(id),
  },
  Mutation: {
    createStockOption: async (_, { symbol }) => {
      const newOption = new StockOption({ symbol });
      await newOption.save();
      return newOption;
    },
    deleteStockOption: async (_, { id }) => {
      await StockOption.findByIdAndDelete(id);
      return true;
    },
    createOptionStrategy: async (_, { name, options }) => {
      const newStrategy = new OptionStrategy({ name, options });
      await newStrategy.save();
      return newStrategy;
    },
    addOptionToStrategy: async (_, { strategyId, optionId }) => {
      const strategy = await OptionStrategy.findById(strategyId);
      strategy.options.push(optionId);
      await strategy.save();
      return strategy;
    },
    deleteOptionFromStrategy: async (_, { strategyId, optionId }) => {
      const strategy = await OptionStrategy.findById(strategyId);
      strategy.options = strategy.options.filter(opt => opt.toString() !== optionId);
      await strategy.save();
      return true;
    },
    deleteOptionStrategy: async (_, { id }) => {
      await OptionStrategy.findByIdAndDelete(id);
      return true;
    },
  },
};

module.exports = resolvers;
