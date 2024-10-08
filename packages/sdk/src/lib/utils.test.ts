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

    it("should be 1003707317073170731707 > 1003.7073170731708", () => {
      const res = BigintDiv(BigInt(123456), BigInt(123));
      expect(res.toString()).toBe("1003707317073170731707");

      const num = BigintToNum(res, MAX_DECIMALS);
      expect(num).toBe(1003.7073170731708);
    });

    it("should be 996306376360808 > 0.000996306376360808", () => {
      // I think some precision is lost here because this division results in
      // 996306376360808.709175738724728 where bigint drops the decimal part
      const res = BigintDiv(BigInt(123), BigInt(123456));
      expect(res.toString()).toBe("996306376360808");

      const num = BigintToNum(res, MAX_DECIMALS);
      expect(num).toBe(0.000996306376360808);
    });

    it("should be 99630000 > 99.63", () => {
      const dstTokenDecimals = 6;
      const dstFilledAmount = BigInt("123000000"); // 6 decimals

      const srcTokenDecimals = 18;
      const srcFilledAmount = BigInt("1234567890000000000"); // 18 decimal
      const res = BigintDiv(dstFilledAmount, srcFilledAmount);
      // 99630000.90663300825036
      expect(res.toString()).toBe("99630000");

      const dec = MAX_DECIMALS - (srcTokenDecimals - dstTokenDecimals);
      const num = BigintToNum(res, dec);
      expect(num).toBe(99.63);
    });

    it("should be 99630000906633 > 99.630000906633", () => {
      const dstTokenDecimals = 6;
      const dstFilledAmount = BigInt("123000000"); // 6 decimals

      const srcTokenDecimals = 12;
      const srcFilledAmount = BigInt("1234567890000"); // 12 decimal
      const res = BigintDiv(dstFilledAmount, srcFilledAmount);
      // 99630000906633
      expect(res.toString()).toBe("99630000906633");

      const dec = MAX_DECIMALS - (srcTokenDecimals - dstTokenDecimals);
      const num = BigintToNum(res, dec);
      expect(num).toBe(99.630000906633);
    });

    it("should be 99630000906633 > 99.630000906633", () => {
      const dstTokenDecimals = 5;
      const dstFilledAmount = BigInt("12300000");

      const srcTokenDecimals = 9;
      const srcFilledAmount = BigInt("1234567890");

      const res = BigintDiv(dstFilledAmount, srcFilledAmount);
      // 9963000090663300
      expect(res.toString()).toBe("9963000090663300");

      const dec = MAX_DECIMALS - (srcTokenDecimals - dstTokenDecimals);
      const num = BigintToNum(res, dec);
      expect(num).toBe(99.630000906633);
    });

    it("should be 100371373170731707317 > 0.010037137317073171", () => {
      const dstTokenDecimals = 9;
      const dstFilledAmount = BigInt("1234567890");

      const srcTokenDecimals = 5;
      const srcFilledAmount = BigInt("12300000");

      const res = BigintDiv(dstFilledAmount, srcFilledAmount);
      // 100371373170731707317
      expect(res.toString()).toBe("100371373170731707317");

      const dec = MAX_DECIMALS - (srcTokenDecimals - dstTokenDecimals);
      const num = BigintToNum(res, dec);
      expect(num).toBe(0.010037137317073171);
    });
  });
});
