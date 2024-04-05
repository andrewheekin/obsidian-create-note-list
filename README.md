# Obsidian Create Note List Plugin

This plugin prepends just below the current note's YAML frontmatter a bulleted list of all notes or folder notes contained within the current note's parent folder. This is useful for creating a table of contents or a list of related notes.

Note, this plugin may be used with folder notes or regular notes. At the moment, there is no option to recursively list notes in subfolders.

## Settings
#### "Sort Order"
Options: Ascending (A-Z) or Descending (Z-A). This setting determines the order in which the notes are listed in the bulleted list.

#### "Date Formatted Notes Only""
Options: Yes or No. This setting determines whether only notes beginning with a YYYY-MM-DD date in the title are included in the bulleted list.


## Example Output

#### Sort Order: Ascending (A-Z) and Date Formatted Notes Only: No
```markdown
---
title: "README"
---

- [[Note 1]]
- [[Note 2]]
- [[Note 3]]
```

#### Sort Order: Descending (Z-A) and Date Formatted Notes Only: Yes
```markdown
---
title: "README"
---

- [[2024-04-05 Note 3]]
- [[2024-04-04 Note 2]]
- [[2024-04-03 Note 1]]
```
