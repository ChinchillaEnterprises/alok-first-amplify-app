import { type ClientSchema, a, defineData } from '@aws-amplify/backend';
import { getWeather } from '../functions/get-weather/resource';

const schema = a.schema({
  getWeather: a
    .query()
    .arguments({
      latitude: a.float().required(),
      longitude: a.float().required(),
    })
    .returns(a.customType({
      temperature: a.integer().required(),
      condition: a.string().required(),
      description: a.string().required(),
      icon: a.string().required(),
      humidity: a.integer().required(),
      windSpeed: a.float().required(),
      city: a.string().required(),
      country: a.string().required(),
    }))
    .authorization(allow => [allow.publicApiKey()])
    .handler(a.handler.function(getWeather))
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'apiKey',
  },
});