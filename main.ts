import {
	App,
	TFile,
	TFolder,
	TAbstractFile,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	Editor,
	MarkdownView
} from "obsidian";

interface CreateNoteListPluginSettings {
	sortOrder: "asc" | "desc";
	dateFormattedOnly: boolean;
}

enum NOTE_LIST_TYPE {
	FILES = "files",
	FOLDERS = "folders",
}

const DEFAULT_SETTINGS: CreateNoteListPluginSettings = {
	sortOrder: "desc",
	dateFormattedOnly: true,
};

export default class CreateNoteListPlugin extends Plugin {
	settings: CreateNoteListPluginSettings;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: "create-note-list-files",
			name: "List files",
			editorCallback: (editor: Editor, view: MarkdownView) => this.createNoteList(NOTE_LIST_TYPE.FILES, editor, view),
		});

		this.addCommand({
			id: "create-note-list-folders",
			name: "List folders",
			editorCallback: (editor: Editor, view: MarkdownView) => this.createNoteList(NOTE_LIST_TYPE.FOLDERS, editor, view),
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new CreateNoteListSettingTab(this.app, this));
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

	async createNoteList(itemType: NOTE_LIST_TYPE, editor: Editor, view: MarkdownView) {		

		try {
			const listedItems: TAbstractFile[] | undefined = view?.file?.parent?.children // TAbstractFile can be either a TFile or a TFolder

			if (!listedItems) {
				new Notice("No items in this directory.");
				return;
			}

			let items;
			if (itemType === NOTE_LIST_TYPE.FILES) {
				const filesInNoteParent = listedItems.filter((item) => item instanceof TFile);

				if (filesInNoteParent.length === 0) {
					new Notice("No files in this directory.");
					return;
				}

				items = filesInNoteParent.map((item: TFile) => item.basename);

			} else if (itemType === NOTE_LIST_TYPE.FOLDERS) {
				const foldersInNoteParent = listedItems.filter((item) => item instanceof TFolder);

				if (foldersInNoteParent.length === 0) {
					new Notice("No folders in this directory.");
					return;
				}

				items = foldersInNoteParent.map((item: TFolder) => item.name);

			} else {
				new Notice("Unknown item type.");
				return;
			}

			if (this.settings.dateFormattedOnly) {
				const datePattern = /^\d{4}-\d{2}-\d{2}/;
				items = items.filter((item) => datePattern.test(item));
			}

			if (this.settings.sortOrder === "asc") {
				items.sort();
			} else if (this.settings.sortOrder === "desc") {
				items.sort().reverse();
			}

			// Prepare the list to be inserted
			const listToInsert =
				items.map((item) => `- [[${item}]]`).join("\n") + "\n\n";

			// Append the list at the cursor position
			editor.replaceRange(
				listToInsert,
				editor.getCursor()
			);

			new Notice("Created list of notes.");
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

		// Sort Order Setting
		new Setting(containerEl)
			.setName("Sort order")
			.setDesc("Choose the sort order for the note list")
			.addDropdown((dropdown) =>
				dropdown
					.addOption("asc", "Asc (A-Z, 0-9)")
					.addOption("desc", "Desc (Z-A, 9-0)")
					.setValue(this.plugin.settings.sortOrder)
					.onChange(async (value: "asc" | "desc") => {
						this.plugin.settings.sortOrder = value;
						await this.plugin.saveSettings();
					})
			);

		// Date Formatted Only Setting
		new Setting(containerEl)
			.setName("Date formatted notes only")
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
