import { Editor, EditorPosition, MarkdownView, Plugin, Notice } from 'obsidian'
import { EditorView, type ViewUpdate } from '@codemirror/view';
import { EditorState, type Extension } from '@codemirror/state';
import { SettingTab } from 'SettingTab';

interface AutoTextWrapPluginSettings {
	textWidth: number;
	wrapMode: number;
}

const DEFAULT_SETTINGS:
Partial<AutoTextWrapPluginSettings> = {
	textWidth: 60,
	wrapMode: 1       // 1 = word, 2 = character
};

export default class AutoTextWrapPlugin extends Plugin {
	settings: AutoTextWrapPluginSettings;

	async loadSettings() {
		// assigns settings to default_settings, which is then overridden by loadData()
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
		if (this.settings.textWidth < 1) { // validate input
			this.settings.textWidth = 60;
			this.saveSettings();
			new Notice('Please enter a valid number');
		}
	}

	async onload(): Promise<void> {
		console.log("Onloading AutoTextWrap...");
		await this.loadSettings();

		this.addSettingTab(new SettingTab(this.app, this));

		let view = this.app.workspace.getActiveViewOfType(MarkdownView);
		
		// doing this upon leaf change ensures that Obsidian always sets view correctly
		this.registerEvent(this.app.workspace.on('active-leaf-change', leaf => {
			// Get the current window (markdownview if in editor, otherwise null)
			view = this.app.workspace.getActiveViewOfType(MarkdownView);
		}));
		
		// Creates an extension to CodeRunner's EditorView that adds the code below to the updateListener,
		// triggering every time the EditorView is updated.
		const changeInspector: Extension = EditorView.updateListener.of((update: ViewUpdate) => {
			if (update.docChanged && view) { // if the document was changed and we're in the right workspace
				const diff = update.state.doc.length - update.startState.doc.length // if negative, text was deleted and we ignore

				// TODO: I don't like that we're using obsidian's API here. 
				let cursor = view.editor.getCursor(); // get the cursor
				const line = cursor.line
				let line_contents = view.editor.getLine(line);
				
				// If the line should be wrapped
				if (cursor.ch == this.settings.textWidth && view.editor.getLine(line).length <= this.settings.textWidth && diff >= 1) {
					if (this.settings.wrapMode == 1) {
						// wrap word
						const index = line_contents.lastIndexOf(' ')+1; // get the last space
						cursor.ch = (index != -1) ? index : cursor.ch; 
					}
										
					console.log("AutoTextWrap: wrapping line");
					view.editor.setCursor(line, 0); // move the cursor back a bit to avoid interfering with insertion
					view.editor.replaceRange('\n', cursor); // add a new line at the old cursor
					// return cursor to the end of the new line
					line_contents = view.editor.getLine(line + 1);
					view.editor.setCursor(line + 1, line_contents.length);	
				}
			}
		});
		
		this.registerEditorExtension(changeInspector);
	}
}