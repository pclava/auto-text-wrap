import { Plugin } from 'obsidian'

export default class AutoTextWrapPlugin extends Plugin {
	onload(): Promise<void> | void {
		console.log("Hello, World!");
	}
}