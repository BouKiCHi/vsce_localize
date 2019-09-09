#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function surroundText(surround, text) {
    return surround + text + surround;
}

function lowerCamelCase(text) {
    var re = /\w+/g;
    var result = "";
    while(true) {
        var match = re.exec(text);
        if (!match) break;
        for(var i = 0; i < match.length; i++) { 
            var s = match[i];
            if (result.length == 0) {
                result += s.toLowerCase();
            } else {
                result += s.charAt(0).toUpperCase() + s.substring(1).toLowerCase();
            }
        }    
    }
    return result;
}

function localizeJson(filename) {
    console.log("json filename:" + filename);

    // make path
    var pathdata = path.parse(filename);
    var ext = pathdata.ext;
    var origpath = path.join(pathdata.dir, pathdata.name + ".orig" + ext);
    var nlspath = pathdata.name + ".nls" + ext;

    const text = fs.readFileSync(filename, 'utf8');
    fs.writeFileSync(origpath, text);

    const json = JSON.parse(text);
    
    if (!("contributes" in json) || !("commands" in json.contributes)) {
        console.log("[json.contributes.commands] is not found!");
        return;
    }

    var ld = {}
    commands = json.contributes.commands;
    for(var i in commands) {
        var o = commands[i];
        var key = o.command;
        var title = o.title;
        // console.log("i:" + i + " key=" + key + " title=" + title);
        var newkey = key+".title"; 
        ld[newkey] = title;
        o.title = surroundText("%",newkey);
    }

    console.log("output nls:" + nlspath);

    fs.writeFileSync(filename, JSON.stringify(json, undefined, 4));
    fs.writeFileSync(nlspath, JSON.stringify(ld, undefined, 4));
}


function localizeTs(filename) {
    console.log("localizeTs:" + filename);
    var re = /localeString\((\".*?\"|\'.*?\')\)/g;

    // make path
    var pathdata = path.parse(filename);
    var ext = pathdata.ext;
    var nlspath = "locale.nls.json";
    var origpath = path.join(pathdata.dir, pathdata.name + ".orig" + ext);

    // read typescript
    const text = fs.readFileSync(filename, 'utf8');
    fs.writeFileSync(origpath, text);

    // read key string
    var oldld = {}
    var ld = {}
    if (fs.existsSync(nlspath)) {
        oldld = JSON.parse(fs.readFileSync(nlspath, 'utf8'));
    }

    // replace localeString
    var output = text.replace(re, function replacer(match, p1) {
        var content = p1.substring(1, p1.length - 1);
        if (content in oldld) return match;
        var key = lowerCamelCase(content);
        ld[key] = content;
        return "localeString('" + key + "')";
    });

    var writeld = {};
    Object.assign(writeld, oldld);
    Object.assign(writeld, ld);

    fs.writeFileSync(filename, output);
    fs.writeFileSync(nlspath, JSON.stringify(writeld, undefined, 4));
    console.log("translation keys:");
    console.table(writeld);
}

function testCaseConverter() {
    var r = [];
    r.push(lowerCamelCase("Hello, Test 123 hoge fuga abcdefg"));
    r.push(lowerCamelCase("Add Text to the end of Selection."));
    r.push(lowerCamelCase("This is a problem, !!!! I can't use charactor like semicolon as a key! ,,,, ;;;;"));
    console.table(r);
}

function usage() {
    console.log(`
Usage: vsce_localize filename

filename:
  *.json:
    Load package.json and replace the contents of json.contributes.commands with key.
    The value of titles are written in package.nls.json.
  example:
    vsce_localize package.json

  *.ts:
    Read TypeScript file and locale.nls.json.
    If the key is not stored, register the key and value in locale.nls.json and replace localeString (). 
    if the key is no stored, register the key and value in locale.nls.json.
    the key is converted as a lowerCamelCase from the content.
  example:
    vsce_localize src/extension.ts

`);
}

function main(filename) {
    if (!filename) { usage();  return; }
    var ext = path.extname(filename);

    switch(ext) {
        case ".json": localizeJson(filename); break;
        case ".ts": localizeTs(filename); break;
        default: console.log("unknown:" + filename); break;
    }
}

var filename = process.argv.length < 2 ? null : process.argv[2];
main(filename);
