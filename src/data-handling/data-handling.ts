import { JsonHandling } from '../utilities/json-handling';
import { Constants } from "../utilities/constants";

export class DataHandling {


  /**
   * Parse Dealer Info from file
   * @param filename
   * @returns dealer object
   */
  static async parseDataFromFile(filename: string): Promise<object | undefined> {
    return await JsonHandling.parseJsonTextToObject(Constants.BUSINESS_ENTITY_FOLDER + filename);
  }
}