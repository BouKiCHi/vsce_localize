## VSCode localize utility

### Usage

```
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
```
