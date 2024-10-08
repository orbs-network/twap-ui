import { BigintDiv, BigintToNum, MAX_DECIMALS } from "./utils";

describe("utils", () => {
  describe("BigintDiv", () => {
    it("should be 100", () => {
      const res = BigintDiv(BigInt(100), BigInt(100));
      expect(res.toString()).toBe("1000000000000000000");

      const num = BigintToNum(res, MAX_DECIMALS);
      expect(num).toBe(1);
    });

    it("should be 50", () => {
      const res = BigintDiv(BigInt(100), BigInt(200));
      expect(res.toString()).toBe("500000000000000000");

      const num = BigintToNum(res, MAX_DECIMALS);
      expect(num).toBe(0.5);
    });

    it("should be 0", () => {
      expect(BigintDiv(BigInt(0), BigInt(100)).toString()).toBe("0");
    });

    it("should be 1003707317073170731707", () => {
      const res = BigintDiv(BigInt(123456), BigInt(123));
      expect(res.toString()).toBe("1003707317073170731707");

      const num = BigintToNum(res, MAX_DECIMALS);
      expect(num).toBe(1003.7073170731708);
    });

    it("should be 996306376360808", () => {
      // I think some precision is lost here because this division results in
      // 996306376360808.709175738724728 where bigint drops the decimal part
      const res = BigintDiv(BigInt(123), BigInt(123456));
      expect(res.toString()).toBe("996306376360808");

      const num = BigintToNum(res, MAX_DECIMALS);
      expect(num).toBe(0.000996306376360808);
    });
  });
});
