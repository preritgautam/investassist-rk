import {
  controller,
  response,
  body,
  post, get, params,
} from '../../../framework/plugins/WebPlugin';
import { Response } from 'express';
import axios from 'axios';
import { config } from '../../../framework/plugins/AppConfigPlugin/decorators/config';
import { AppConfigType } from '../../config';

@controller({ route: '/api/googlePlaces' })
export class GooglePlacesController {
  constructor(
    @config('google') private readonly googlePlacesConfig: AppConfigType['google'],
  ) {
  }

  @post('/')
  async getGooglePlacesSuggestion(
    @body('searchText') searchText: string,
    @response() res: Response,
  ) {
    const googleResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=
      ${this.googlePlacesConfig.placesApiKey}&input=${searchText}&components=country:us`,
    );
    res.send({ data: googleResponse.data });
  }

  @get('/:placeId')
  async getDetailsByGooglePlaceId(
    @params('placeId') placeId: string,
    @response() res: Response,
  ) {
    const googleResponse = await axios.get(
      `https://maps.googleapis.com/maps/api/place/details/json?key=
      ${this.googlePlacesConfig.placesApiKey}&place_id=${placeId}`,
    );
    res.send({ data: googleResponse.data });
  }
}
