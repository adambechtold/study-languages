const path = require("path");
const fs = require("fs");
const { convertToMap, parseXlsx } = require("./xlsx-as-function");

const TEST_XLSX = path.join(__dirname, "test.xlsx");

describe("XlsxAsFunction", () => {
  describe("parseXlsx", () => {
    it("should have a test .xlsx in place", () => {
      const testXlsx = TEST_XLSX;
      expect(fs.existsSync(testXlsx)).toBe(true);
    });

    it("should parse the sheet names", () => {
      const xlsxDocument = parseXlsx(TEST_XLSX, {});
      expect(xlsxDocument[0].name).toBe("Sheet1");
      expect(xlsxDocument[1].name).toBe("CustomSheet");
    });

    it("should parse data from each sheet", () => {
      const xlsxDocument = parseXlsx(TEST_XLSX, {});
      expect(xlsxDocument[0].data).toEqual([
        ["header1", "header2"],
        [1, false],
        [2, true],
        [3],
        ["multi\nline", "\\n"],
        [undefined, '"testInQuotes"'],
        [undefined, "test with spaces"],
        [],
        ["lastRow", "lastRow"],
      ]);
      expect(xlsxDocument[1].data).toEqual([
        ["h1", "h2"],
        [1, 2],
        [3, 4],
      ]);
    });

    it("should be able to parse new lines as a list of string", () => {
      const xlsxDocument = parseXlsx(TEST_XLSX, { readNewLinesAsList: true });
      expect(xlsxDocument[0].data[4]).toEqual([["multi", "line"], "\\n"]);
    });

    it("should have the ability to filter out empty rows", () => {
      const xlsxDocument = parseXlsx(TEST_XLSX, { filterEmptyRows: true });
      expect(xlsxDocument[0].data.length).toEqual(8);
      expect(xlsxDocument[0].data[7]).toEqual(["lastRow", "lastRow"]);
    });
  });

  describe("convertToMap", () => {
    it("should convert the XLSXDocument to a XLSXDocumentMap", () => {
      const xlsxDocument = parseXlsx(TEST_XLSX, {});
      const xlsxDocumentMap = convertToMap(xlsxDocument);
      expect(xlsxDocumentMap.has("Sheet1")).toBe(true);
      expect(xlsxDocumentMap.get("CustomSheet")).toEqual([
        new Map([
          ["h1", 1],
          ["h2", 2],
        ]),
        new Map([
          ["h1", 3],
          ["h2", 4],
        ]),
      ]);
    });
  });
});
