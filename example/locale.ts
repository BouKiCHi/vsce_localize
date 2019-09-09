// locale.ts
// this file is provided by zlib license
//
// usage 
// 1. add the following code to head of your TypeScript code
// import { localeString } from './locale.js';
// 
// 2. surround text which you want to translate with localeString()
// 3. make locale.nls.json
// 4. copy and edit locale.nls.(languageCode).json
// 5. done!
//

import fs = require('fs');
import path = require('path');

function readNls(table: any, nlsfile : string) {
    const fullpath = path.join(__dirname, nlsfile);
    if (!fs.existsSync(fullpath)) { return; }
    const json = JSON.parse(fs.readFileSync(fullpath, 'utf8'));
    Object.assign(table, json);
}

const code = <string>JSON.parse(<string>process.env.VSCODE_NLS_CONFIG).locale;

var nls : {[index:string] : string } = {};
readNls(nls, "../locale.nls.json");
readNls(nls, "../locale.nls." + code + ".json");


export function localeString(text: string) {
    return text in nls ? nls[text] : text;
}