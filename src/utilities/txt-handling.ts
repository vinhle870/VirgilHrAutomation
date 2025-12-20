import { promises as fsPromises } from 'fs';

export class TxtHandling {
    /**
     * Read raw data from .xml, .json, .txt
     * @param filepath
     * @returns string
     */
    static async readRawFile(filepath: string): Promise<string|undefined> {

        try{
            return await fsPromises.readFile(filepath, 'utf-8');
        }catch(error){
            return undefined;
        }
    }
}