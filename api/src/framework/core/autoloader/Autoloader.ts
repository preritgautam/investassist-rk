import * as fs from 'fs';
import * as path from 'path';

export class Autoloader {
  async load(dir) {
    const files = this.getAllFiles(dir)
      .filter((file) =>
        file.indexOf('.') !== 0 &&
        (file.slice(-3) === '.ts' || file.slice(-3) === '.js') &&
        (file.slice(-8) !== '.spec.ts') &&
        (file.slice(-8) !== '.spec.js') &&
        (file.slice(-8) !== '.test.ts') &&
        (file.slice(-8) !== '.test.js'));
    for (const file of files) {
      console.log('Loading File: ', file);
      await import(file).catch((e) => console.log(e));
    }
  }

  private getAllFiles(dirPath: string, arrayOfFiles?: string[]): string[] {
    arrayOfFiles = arrayOfFiles || [];
    let files: string[];

    try {
      files = fs.readdirSync(dirPath);
    } catch (e) {
      console.warn(`[Warning] - ${e.toString()}`);
      return arrayOfFiles;
    }

    files.forEach((file: string) => {
      const filePath = path.join(dirPath, file);
      if (fs.statSync(dirPath + '/' + file).isDirectory()) {
        arrayOfFiles = this.getAllFiles(filePath, arrayOfFiles);
      } else {
        arrayOfFiles.push(filePath);
      }
    });

    return arrayOfFiles;
  }
}
