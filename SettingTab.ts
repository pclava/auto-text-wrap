import AutoTextWrapPlugin from "./main";
import { App, PluginSettingTab, Setting } from 'obsidian'

export class SettingTab extends PluginSettingTab {
    plugin: AutoTextWrapPlugin;

    constructor(app: App, plugin: AutoTextWrapPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        let { containerEl } = this;

        // clear the container
        containerEl.empty();

        // create text with html
        containerEl.createEl('h1', { text: 'AutoTextWrap' });
        containerEl.createEl('p', { text: 'A simple plugin to wrap text automatically. Created by  '}).createEl("a", {
            text: "Paul Clavaud",
            href: "https://github.com/pclava"
        });

        // create a new entry
        new Setting(containerEl)
            .setName('Text Width')    // label
            .setDesc('Select how many characters should be allowed per line before wrapping')
            .addText((text) =>        // text input
                text
                    .setPlaceholder('enter a number')
                    .setValue(this.plugin.settings.textWidth.toString())
                    .onChange(async (value) => {
                        this.plugin.settings.textWidth = parseInt(value);
                        await this.plugin.saveSettings();
                    })
      );
    }
}