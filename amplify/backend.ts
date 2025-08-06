import { defineBackend } from '@aws-amplify/backend';
import { data } from './data/resource';
import { getWeather } from './functions/get-weather/resource';

/**
 * @see https://docs.amplify.aws/react/build-a-backend/ to add storage, functions, and more
 */
defineBackend({
  data,
  getWeather
});