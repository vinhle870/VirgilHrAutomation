import { TxtHandling } from './txt-handling';
export class XmlHandling extends TxtHandling {

  /**
   * Convert xml format text to javascript object
   * @param filepath
   * @returns return javascript object or undefined value if any error
   */
  static async parseXmlDataToObject(filepath: string): Promise<object | undefined> {
    try {
      const rawdata = await this.readRawFile(filepath)
      // use xml2js.parseStringPromise via dynamic import to avoid missing types at compile time
      // @ts-ignore
      const { parseStringPromise } = await import('xml2js');
      const result = await parseStringPromise(rawdata);
      return result;
    } catch (error) {
        return undefined;
    }
  }

}