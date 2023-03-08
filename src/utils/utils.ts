import * as bcrypt from 'bcrypt';

export default class Utils {
  static cloneDeep(value: any) {
    return JSON.parse(JSON.stringify(value));
  }

  static async createHash(value: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    const hashedString: string = await bcrypt.hash(value, salt);
    return hashedString || null;
  }
}
