/* eslint-disable @typescript-eslint/no-explicit-any */
import chalk, { ChalkInstance } from "chalk";

export class ChalkLogger {
	private readonly chalkInstance: ChalkInstance;
	private readonly title: string;

	public constructor(colorHex: string, title: string) {
		this.chalkInstance = chalk.hex(colorHex);
		this.title = title;
	}

	public log(message: string, ...data: any[]) {
		return console.log(this.chalkInstance(`[${this.title}] ${message}`), ...data);
	}

	public info(message: string, ...data: any[]) {
		return console.info(this.chalkInstance(`[${this.title}] ${message}`), ...data);
	}

	public error(message: string, ...data: any[]) {
		return console.error(this.chalkInstance(`[${this.title}] ${message}`), ...data);
	}

	public warn(message: string, ...data: any[]) {
		return console.warn(this.chalkInstance(`[${this.title}] ${message}`), ...data);
	}

	public debug(message: string, ...data: any[]) {
		return console.debug(this.chalkInstance(`[${this.title}] ${message}`), ...data);
	}

	public trace(message: string, ...data: any[]) {
		return console.trace(this.chalkInstance(`[${this.title}] ${message}`), ...data);
	}

	public group(message: string, ...data: any[]) {
		return console.group(this.chalkInstance(`[${this.title}] ${message}`), ...data);
	}

	public groupEnd() {
		return console.groupEnd();
	}
}
