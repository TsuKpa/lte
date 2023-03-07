export default class Utils {
  static cloneDeep(value: any) {
    return JSON.parse(JSON.stringify(value));
  }
}
