import { Command } from "commander";

const program = new Command();

program.option('--mode <mode>', 'development', 'production')

program.parse();

export default program.opts()