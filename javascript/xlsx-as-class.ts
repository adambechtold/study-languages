//============== Stateful Approach ==================
import { promises as fs } from "fs";
import xlsx from "node-xlsx";

type XLSXDocument = XLSXSheet[];
type XLSXSheet = {
  name: string;
  data: any[][];
};
type XLSXDocumentAsMap = Map<string, Map<string, any>[]>;

type BuildSheetOptions = {
  writeListWithNewlines?: boolean;
  sheetName?: string;
};
type ReadOptions = {
  readNewLinesAsList?: boolean;
  filterEmptyRows?: boolean;
};
type SheetInputData = object[] | Map<string, any>[];

export class XLSX {
  private document: XLSXDocument;
  private filePath?: string;

  constructor(document?: XLSXDocument, filePath?: string) {
    const defaultDocument: XLSXDocument = [];
    this.document = document || defaultDocument;
    this.filePath = filePath;
  }

  public setFilePath(filePath: string) {
    this.filePath = filePath;
  }

  // Getters
  public getSheetNames() {
    return this.document.map((sheet) => sheet.name);
  }

  public getSheetByName(sheetName: string) {
    return this.document.find((sheet) => sheet.name === sheetName);
  }

  public getAsMap(): XLSXDocumentAsMap {
    const map = new Map<string, Map<string, any>[]>();
    this.document.forEach((sheet) => {
      map.set(sheet.name, parseSheetIntoList(sheet));
    });
    return map;
  }

  // Instance Methods to Read and Write
  public async write() {
    if (!this.filePath) {
      throw new Error("No file path provided");
    }

    await writeXlsxDocument(this.document, this.filePath);
  }

  public async addSheetWithData(
    sheetName: string,
    data: SheetInputData,
    options?: BuildSheetOptions,
  ) {
    const sheet = buildSheetFromData(sheetName, data, options);
    this.addSheet(sheet);
  }

  public addSheet(sheet: XLSXSheet) {
    const alreadyHasSheetWithSameName = this.document.some(
      (existingSheet) => existingSheet.name === sheet.name,
    );
    if (alreadyHasSheetWithSameName) {
      throw new Error(`Sheet with name ${sheet.name} already exists`);
    }
    this.document.push(sheet);
  }

  public replaceSheetData(
    sheetName: string,
    data: SheetInputData,
    options?: BuildSheetOptions,
  ) {
    const sheet = buildSheetFromData(sheetName, data, options);
    this.replaceSheet(sheet);
  }

  public replaceSheet(sheet: XLSXSheet) {
    const index = this.document.findIndex(
      (existingSheet) => existingSheet.name === sheet.name,
    );
    if (index === -1) {
      throw new Error(`Sheet with name ${sheet.name} does not exist`);
    }
    this.document[index] = sheet;
  }

  public upsertSheetWithData(
    sheetName: string,
    data: SheetInputData,
    options?: BuildSheetOptions,
  ) {
    if (this.getSheetByName(sheetName)) {
      this.replaceSheetData(sheetName, data, options);
    } else {
      this.addSheetWithData(sheetName, data, options);
    }
  }

  // Static Methods to Create XSLX
  static buildFromData(
    data: SheetInputData,
    options?: BuildSheetOptions,
  ): XLSX {
    const sheetName = options?.sheetName || "Sheet1";
    const sheet = buildSheetFromData(sheetName, data, options);
    return new XLSX([sheet]);
  }

  static async writeToXlsxSheet(
    filePath: string,
    data: SheetInputData,
    options?: BuildSheetOptions,
  ): Promise<XLSX> {
    const xlsxDocument = XLSX.buildFromData(data, options);
    xlsxDocument.setFilePath(filePath);

    await xlsxDocument.write();

    return xlsxDocument;
  }

  static async parseFile(
    filePath: string,
    options?: ReadOptions,
  ): Promise<XLSX> {
    return parseXlsxFile(filePath, options).then(
      (document) => new XLSX(document, filePath),
    );
  }

  public printToConsole() {
    this.document.forEach((sheet) => {
      console.log(sheet.name);
      console.log("----------------");
      sheet.data.forEach((row) => {
        console.log(row);
      });
    });
  }
}

const convertDataPointToCellEntry = (
  data: any,
  convertArrayIntoNewLines?: boolean,
) => {
  if (data === undefined) {
    // TODO: Choose a different value for an empty cell
    // This doesn't work with counta, i.e. it will count an empty string as a value
    return "";
  }
  if (data === null) {
    return "null";
  } else if (typeof data === "boolean") {
    // The default behavior of this is sensible. It just does a lowercase string. It parses it back well too
    return data;
  } else if (data instanceof Date) {
    // The default behavior of this is sensible. It converts it into a number that excel parses as a date.
    // It can read this back if you have cellDates set to true.
    return data;
  } else if (Array.isArray(data) && convertArrayIntoNewLines) {
    return convertArrayToNewlineDelimitedString(data);
  } else if (typeof data === "object") {
    return JSON.stringify(data);
  } else {
    return data;
  }
};

// This is for ease of reading many items
const convertArrayToNewlineDelimitedString = (arr: any[]) => {
  return arr.join("\n");
};

const convertStringWithNewLinesToListOfStrings = (str: string) => {
  const hasNewLines = str.includes("\n");
  return hasNewLines ? str.split("\n") : str;
};

export function parseSheetIntoList(sheet: XLSXSheet): Map<string, any>[] {
  const headers = sheet.data[0];
  const data = sheet.data.slice(1);
  return data.map((row) => {
    const obj: Map<string, any> = new Map();
    row.forEach((cell, index) => {
      obj.set(headers[index], cell);
    });
    return obj;
  });
}

export async function parseXlsxFile(
  filePath: string,
  options?: ReadOptions,
): Promise<XLSXDocument> {
  const workSheetsFromFile = xlsx.parse(filePath, { cellDates: true });

  if (options?.readNewLinesAsList) {
    workSheetsFromFile.forEach((sheet) => {
      sheet.data = sheet.data.map((row) =>
        row.map((cell) =>
          typeof cell === "string"
            ? convertStringWithNewLinesToListOfStrings(cell)
            : cell,
        ),
      );
    });
  }

  // TODO: Write test for this
  if (options?.filterEmptyRows) {
    workSheetsFromFile.forEach((sheet) => {
      const isRowEmpty = (row: any[]) =>
        row.length === 0 ||
        row.every((cell) => cell === undefined || cell === null);
      sheet.data = sheet.data.filter((row) => !isRowEmpty(row));
    });
  }

  return workSheetsFromFile;
}

export async function writeXlsxDocument(
  xlsxDocument: XLSXDocument,
  filePath: string,
) {
  const input = xlsxDocument.map((sheet) => ({
    name: sheet.name,
    data: sheet.data,
    options: {},
  }));
  const buffer = xlsx.build(input);
  await fs.writeFile(filePath, buffer);
  return new XLSX(xlsxDocument);
}

function getAllPossibleHeadersFromObjectList(data: object[]): string[] {
  const headers = new Set<string>();
  data.forEach((row) => {
    Object.keys(row).forEach((key) => headers.add(key));
  });
  return Array.from(headers);
}

function getAllPossibleHeadersFromMapList(data: Map<string, any>[]): string[] {
  const headers = new Set<string>();
  data.forEach((row) => {
    Array.from(row.keys()).forEach((key) => headers.add(key));
  });
  return Array.from(headers);
}

function buildSheetFromData(
  sheetName: string,
  data: object[] | Map<string, any>[],
  options?: BuildSheetOptions,
): XLSXSheet {
  const allElementsAreMaps = data.every((element) => element instanceof Map);
  const allElementsAreObjects = data.every(
    (element) => typeof element === "object",
  ); // This will also be true for list of maps

  if (allElementsAreMaps) {
    return buildSheetFromMapList(
      sheetName,
      data as Map<string, any>[],
      options,
    );
  } else if (allElementsAreObjects) {
    return buildSheetFromObjectList(sheetName, data as object[], options);
  } else {
    throw new Error("Data must be an array of objects or an array of maps");
  }
}

function buildSheetFromObjectList(
  sheetName: string,
  data: object[],
  options?: BuildSheetOptions,
): XLSXSheet {
  const headers = getAllPossibleHeadersFromObjectList(data);
  const dataRows = data.map((row) =>
    headers.map((header) =>
      convertDataPointToCellEntry(row[header], options?.writeListWithNewlines),
    ),
  );
  return { name: sheetName, data: [headers, ...dataRows] };
}

function buildSheetFromMapList(
  sheetName: string,
  data: Map<string, any>[],
  options?: BuildSheetOptions,
): XLSXSheet {
  const headers = getAllPossibleHeadersFromMapList(data);
  const dataRows = data.map((row) =>
    headers.map((header) =>
      convertDataPointToCellEntry(
        row.get(header),
        options?.writeListWithNewlines,
      ),
    ),
  );
  return { name: sheetName, data: [headers, ...dataRows] };
}
