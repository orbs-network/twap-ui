export class TimeFormat {
  static Minutes = new TimeFormat("Minutes", 1000 * 60);
  static Hours = new TimeFormat("Hours", this.Minutes.value * 60);
  static Days = new TimeFormat("Days", this.Hours.value * 24);

  static All = [this.Minutes, this.Hours, this.Days];

  static valueOf(millis: number) {
    return [...this.All].reverse().find((it) => it.value <= millis)!;
  }

  constructor(public key: string, public value: number) {}

  toString() {
    return this.key;
  }

  uiToMillis(value: string) {
    return this.value * Math.max(1, parseFloat(value));
  }

  millisToUi(millis: number) {
       return parseFloat((millis / this.value).toFixed(2));
  }

  transmute(newFormat: TimeFormat, millis: number) {
    return (millis / this.value) * newFormat.value;
  }
}
