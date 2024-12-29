const xlsx = require("node-xlsx");

/*
Relatedly, stateful objects are sometimes useful or even necessary, but if something can be done with a function, use a function.

Haverbeke, Marijn. Eloquent JavaScript, 3rd Edition: A Modern Introduction to Programming (p. 176). No Starch Press. Kindle Edition. 
 */

type XLSXDocument = XLSXSheet[];
type XLSXSheet = {
  name: string;
  data: any[][];
};
type ParseOptions = {
  readNewLinesAsList?: boolean;
  filterEmptyRows?: boolean;
};
export function parseXlsx(
  filePath: string,
  options: ParseOptions,
): XLSXDocument {
  const worksheets = xlsx.parse(filePath, { cellDates: true });

  if (options?.readNewLinesAsList) {
    worksheets.forEach((sheet) => {
      sheet.data = sheet.data.map((row) =>
        row.map((cell) =>
          typeof cell === "string"
            ? convertStringWithNewLinesToListOfStrings(cell)
            : cell,
        ),
      );
    });
  }

  if (options?.filterEmptyRows) {
    worksheets.forEach((sheet) => {
      const isRowEmpty = (row: any[]) =>
        row.length === 0 ||
        row.every((cell) => cell === undefined || cell === null);
      sheet.data = sheet.data.filter((row) => !isRowEmpty(row));
    });
  }

  return worksheets;
}

type XLSXSheetMap = Map<string, any>[];
type XLSXDocumentMap = Map<string, XLSXSheetMap>;
export function convertToMap(doc: XLSXDocument): XLSXDocumentMap {
  const map: XLSXDocumentMap = new Map<string, XLSXSheetMap>();
  doc.forEach((sheet) => {
    const headers = sheet.data[0];
    const data = sheet.data.slice(1);
    const sheetMap = data.map((row) => {
      const obj: Map<string, any> = new Map();
      row.forEach((cell, index) => {
        obj.set(headers[index], cell);
      });
      return obj;
    });
    map.set(sheet.name, sheetMap);
  });
  return map;
}

const convertStringWithNewLinesToListOfStrings = (str: string) => {
  const hasNewLines = str.includes("\n");
  return hasNewLines ? str.split("\n") : str;
};
