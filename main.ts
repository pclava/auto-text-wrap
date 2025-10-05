import { Editor, MarkdownView, Plugin } from 'obsidian'
import { EditorView, type ViewUpdate } from '@codemirror/view';
import { EditorState, type Extension } from '@codemirror/state';
import { SettingTab } from 'SettingTab';

interface AutoTextWrapPluginSettings {
	textWidth: number;
}

const DEFAULT_SETTINGS:
Partial<AutoTextWrapPluginSettings> = {
	textWidth: 60,
};

export default class AutoTextWrapPlugin extends Plugin {
	settings: AutoTextWrapPluginSettings;

	async loadSettings() {
		// assigns settings to default_settings, which is then overridden by loadData()
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}

	async onload(): Promise<void> {
		console.log("Onloading AutoTextWrap...");
		await this.loadSettings();

		this.addSettingTab(new SettingTab(this.app, this));

		// // Get the current window (markdownview if in editor, otherwise null)
		const view = this.app.workspace.getActiveViewOfType(MarkdownView);
		
		// Creates an extension to CodeRunner's EditorView that adds the code below to the updateListener,
		// triggering every time the EditorView is updated.
		const changeInspector: Extension = EditorView.updateListener.of((update: ViewUpdate) => {
			if (update.docChanged) { // if the document was changed
				const diff = update.state.doc.length - update.startState.doc.length // if negative, text was deleted

				// TODO: i don't like that we're using obsidian's API here
				if (view) { // if the view is the editor, which it always will be, so this feels redundant
					const cursor = view.editor.getCursor(); // get the cursor
					const line = cursor.line
					
					// if cursor at 20, line is less than 20ch and text was added
					if (cursor.ch == this.settings.textWidth && view.editor.getLine(line).length <= this.settings.textWidth && diff >= 1) {
						view.editor.setCursor(line, 0); // move the cursor back a bit
						view.editor.replaceRange('\n', cursor); // add a new line
						view.editor.setCursor(line+1, 0); // move the cursor to the new line
					}
				}
			}
		});
		
		this.registerEditorExtension(changeInspector);
	}
}