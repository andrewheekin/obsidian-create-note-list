import {
	App,
	TFile,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
} from "obsidian";

interface CreateNoteListPluginSettings {
	sortOrder: "asc" | "desc";
	dateFormattedOnly: boolean;
}

const DEFAULT_SETTINGS: CreateNoteListPluginSettings = {
	sortOrder: "desc",
	dateFormattedOnly: true,
};

const CONSOLE_LOGGING = false;

export default class CreateNoteListPlugin extends Plugin {
	settings: CreateNoteListPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "create-note-list-files",
			name: "Create NoteList: Files",
			callback: () => this.createNoteList("files"),
		});

		this.addCommand({
			id: "create-note-list-folders",
			name: "Create NoteList: Folders",
			callback: () => this.createNoteList("folders"),
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new CreateNoteListSettingTab(this.app, this));
	}

	onunload() {
		CONSOLE_LOGGING && console.log("Unloading Create NoteList plugin");
	}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
	async appendListBelowFrontMatter(file: TFile, listToInsert: string) {
		const { vault } = this.app;
		let content = await vault.read(file);

		CONSOLE_LOGGING && console.log("Content:", content);

		// Define a regex to find YAML frontmatter
		const frontMatterRegex = /^---\s*\n[\s\S]*?\n---\s*\n/;
		const match = content.match(frontMatterRegex);

		if (match && match.index !== undefined) {
			// If frontmatter is present, split the content and insert the list after the frontmatter
			const indexAfterFrontMatter = match.index + match[0].length;
			content =
				content.slice(0, indexAfterFrontMatter) +
				listToInsert +
				content.slice(indexAfterFrontMatter);

			CONSOLE_LOGGING &&
				console.log("Content after inserting list:", content);
		} else {
			// If no frontmatter, just prepend the list
			content = listToInsert + content;

			CONSOLE_LOGGING && console.log("no frontmatter", content);
		}

		await vault.modify(file, content);
		new Notice("List added to the note.");
	}

	async createNoteList(itemType: "files" | "folders") {
		const { vault } = this.app;
		const activeFile = this.app.workspace.getActiveFile();

		CONSOLE_LOGGING && console.log("Active File:", activeFile);
		// Check if there's an active file
		if (!activeFile) {
			new Notice("No active note.");
			return;
		}

		const basePath = activeFile.parent?.path;

		CONSOLE_LOGGING && console.log("Base Path:", basePath);

		if (!basePath) {
			new Notice("Error accessing file system.");
			return;
		}

		try {
			const listedItems = await vault.adapter.list(basePath);
			CONSOLE_LOGGING && console.log("ListedItems:", listedItems);

			let items;
			if (itemType === "files") {
				if (!listedItems.files.length) {
					new Notice("No files in this directory.");
					return;
				}

				// Get all files in the directory. Strip the path from the file name and remove the file extension from the name
				items = listedItems.files;

				items = items.map((item) =>
					item.slice(item.lastIndexOf("/") + 1, item.lastIndexOf("."))
				);

				CONSOLE_LOGGING &&
					console.log(
						"File items after stripping path and extension:",
						items
					);
			} else if (itemType === "folders") {
				if (!listedItems.folders.length) {
					new Notice("No folders in this directory.");
					return;
				}

				// Get all folders in the directory. Strip the path from the folder name
				items = listedItems.folders;

				items = items.map((item) =>
					item.slice(item.lastIndexOf("/") + 1)
				);

				CONSOLE_LOGGING &&
					console.log("Folder items after stripping path:", items);
			} else {
				new Notice("Unknown item type.");
				return;
			}

			if (this.settings.dateFormattedOnly) {
				const datePattern = /^\d{4}-\d{2}-\d{2}/;
				items = items.filter((item) => datePattern.test(item));
				CONSOLE_LOGGING &&
					console.log(
						"Date pattern match set to true. Here are filteredItems after date pattern match:",
						items
					);
			}

			if (this.settings.sortOrder === "asc") {
				items.sort();
			} else if (this.settings.sortOrder === "desc") {
				items.sort().reverse();
			}

			CONSOLE_LOGGING && console.log("Sorted Items:", items);

			// Prepare the list to be inserted
			const listToInsert =
				items.map((item) => `- [[${item}]]`).join("\n") + "\n\n\n";

			CONSOLE_LOGGING && console.log("ListToInsert:", listToInsert);

			// Append the list right below the YAML frontmatter
			await this.appendListBelowFrontMatter(activeFile, listToInsert);
		} catch (error) {
			console.error("Error listing items: ", error);
			new Notice("Error accessing file system.");
		}
	}
}

export class CreateNoteListSettingTab extends PluginSettingTab {
	plugin: CreateNoteListPlugin;

	constructor(app: App, plugin: CreateNoteListPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();

		containerEl.createEl("h2", { text: "Create NoteList Settings" });

		// Sort Order Setting
		new Setting(containerEl)
			.setName("Sort Order")
			.setDesc("Choose the sort order for the note list")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("asc", "Ascending")
					.addOption("desc", "Descending")
					.setValue(this.plugin.settings.sortOrder)
					.onChange(async (value: "asc" | "desc") => {
						this.plugin.settings.sortOrder = value;
						await this.plugin.saveSettings();
					})
			);

		// Date Formatted Only Setting
		new Setting(containerEl)
			.setName("Date Formatted Notes Only")
			.setDesc(
				"Include only notes that start with YYYY-MM-DD in the list"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.dateFormattedOnly)
					.onChange(async (value: boolean) => {
						this.plugin.settings.dateFormattedOnly = value;
						await this.plugin.saveSettings();
					})
			);
	}
}
