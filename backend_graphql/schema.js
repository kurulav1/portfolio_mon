const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type StockOption {
    id: ID!
    symbol: String!
  }

  type OptionStrategy {
    id: ID!
    name: String!
    options: [StockOption!]!
  }

  type StockData {
    status: String!
    from: String!
    symbol: String!
    open: Float!
    high: Float!
    low: Float!
    close: Float!
    volume: Int!
    afterHours: Float
    preMarket: Float
  }

  type OptionData {
    ticker: String!
    underlying_asset: String!
    option_type: String!
    expiration_date: String!
    strike_price: Float!
    price: Float!
  }

  type Query {
    getStockData(ticker: String!): StockData
    getOptionsChain(ticker: String!): [OptionData!]
    getStockOptions: [StockOption!]!
    getOptionStrategies: [OptionStrategy!]!
    getOptionStrategy(id: ID!): OptionStrategy
  }

  type Mutation {
    createStockOption(symbol: String!): StockOption!
    deleteStockOption(id: ID!): Boolean
    createOptionStrategy(name: String!, options: [ID!]!): OptionStrategy!
    addOptionToStrategy(strategyId: ID!, optionId: ID!): OptionStrategy!
    deleteOptionFromStrategy(strategyId: ID!, optionId: ID!): Boolean
    deleteOptionStrategy(id: ID!): Boolean
  }
`;

module.exports = typeDefs;
