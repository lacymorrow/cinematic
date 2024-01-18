# Electron Examples

From the [Electron Docs](https://www.electronjs.org/docs)

## Drag and Drop

https://www.electronjs.org/docs/latest/tutorial/native-file-drag-drop

## Progress Bar

```js
windows.mainWindow.setProgressBar(c)
```

## Recent Documents

```js
app.addRecentDocument(path)

app.clearRecentDocuments()
```

## File Associations

```js
app.setAsDefaultProtocolClient(protocol[, path, args])
```

## Spell Check

```js
webPreferences: {
	spellcheck: true
}
```

Spell check context menu

```js
myWindow.webContents.on('context-menu', (event, params) => {
  const menu = new Menu()

  // Add each spelling suggestion
  for (const suggestion of params.dictionarySuggestions) {
    menu.append(new MenuItem({
      label: suggestion,
      click: () => myWindow.webContents.replaceMisspelling(suggestion)
    }))
  }

  // Allow users to add the misspelled word to the dictionary
  if (params.misspelledWord) {
    menu.append(
      new MenuItem({
        label: 'Add to dictionary',
        click: () => myWindow.webContents.session.addWordToSpellCheckerDictionary(params.misspelledWord)
      })
    )
  }

  menu.popup()
})
```
