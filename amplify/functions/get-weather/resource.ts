import { defineFunction, secret } from '@aws-amplify/backend';

export const getWeather = defineFunction({
  name: 'get-weather',
  entry: './handler.ts',
  environment: {
    OPENWEATHER_API_KEY: secret('OPENWEATHER_API_KEY')
  }
});