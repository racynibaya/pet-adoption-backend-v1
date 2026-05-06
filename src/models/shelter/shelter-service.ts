import { ZodError } from 'zod';
import { ShelterCreateDTO, ShelterType } from './shelter-types';
import { BadRequestError } from '@utils/error';

class ShelterService {
  validateShelterData(data: ShelterCreateDTO) {
    try {
      const parsedData = ShelterType.parse(data);

      return parsedData;
    } catch (error) {
      if (error instanceof ZodError)
        throw new BadRequestError('Invalid shelter data');

      throw error;
    }
  }
}

export default new ShelterService();
