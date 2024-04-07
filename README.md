# Obsidian Create Note List Plugin

This plugin prepends a bulleted list of all notes (or folder notes) contained within the current note's parent folder just below the current note's YAML frontmatter. This is useful for creating a table of contents or a list of related notes.

Note, this plugin may be used with folder notes or regular notes. At the moment, there is no option to recursively list notes in subfolders.

## Commands
### "Create NoteList: List Files"
This command creates a bulleted list of all notes in the current note's parent folder. The list is sorted according to the settings.

### "Create NoteList: List Folders"
This command creates a bulleted list of all folder notes in the current note's parent folder. The list is sorted according to the settings.

## Settings
#### "Sort Order"
- Options: Ascending (A-Z) or Descending (Z-A)
- This setting determines the order in which the notes are listed in the bulleted list.

#### "Date Formatted Notes Only""
- Options: Yes or No
- This setting determines whether only notes beginning with a YYYY-MM-DD date in the title are included in the bulleted list.


## Example Output

### Example 1
Example folder structure #1:
```
Roman Emperors
├── Roman Emperors.md
├── Augustus.md
├── Julius Caesar.md
└── Nero.md
```

`Roman Emperors.md` after running "Create NoteList: List Files" with the `Sort Order: Ascending (A-Z)` and `Date Formatted Notes Only: No`
```markdown
---
title: "Roman Emperors"
---

- [[Augustus]]
- [[Julius Caesar]]
- [[Nero]]
```


### Example 2
Example folder structure #2:
```
My Folder
├── 2024-04-03 Note 1.md
├── 2024-04-04 Note 2.md
├── 2024-04-05 Note 3.md
├── Note 4.md
├── Note 5.md
└── My Note.md
```

`My Note.md` after running "Create NoteList: List Files" with `Sort Order: Descending (Z-A)` and `Date Formatted Notes Only: Yes`
```markdown
---
title: "My Note"
---

- [[2024-04-05 Note 3]]
- [[2024-04-04 Note 2]]
- [[2024-04-03 Note 1]]
```

### Example 3 (Folder Notes)
Example folder structure #3 with "Folder Notes" (Notes in a folder with the same name as the note):
```
Roman Emperors
├── Roman Emperors.md
├── Augustus
│   └── Augustus.md
├── Julius Caesar
│   └── Julius Caesar.md
└── Nero
    └── Nero.md
```

`Roman Emperors.md` after running "Create NoteList: List Folders" with `Sort Order: Ascending (A-Z)` and `Date Formatted Notes Only: No`
```markdown
---
title: "Roman Emperors"
---

- [[Augustus]]
- [[Julius Caesar]]
- [[Nero]]
```



## Changelog
See [CHANGELOG.md](CHANGELOG.md) for a list of changes.
