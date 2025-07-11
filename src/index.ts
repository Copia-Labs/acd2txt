import { getAcdPrograms } from "@copia-automation/acd-parser/src/extract/programs/programs";
import { getAcdRoutines } from "@copia-automation/acd-parser/src/extract/routines/routines";
import { getAcdRungs } from "@copia-automation/acd-parser/src/extract/rungs/rungs";
import { translateTagReferences } from "@copia-automation/acd-parser/src/extract/extract_helpers";
import { getAcdAOIs } from "@copia-automation/acd-parser/src/extract/aoi/aoi";
import { parseAcd } from "@copia-automation/acd-parser";

import { parseNeutralText } from "./neutralText/grammarWrapper";
import { layoutAndRenderRung } from "./renderRungs";
import * as fs from "fs";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";
import path from "path";

const banner = `
              ____ ___  ____ ___    _
    \x1b[102m      \x1b[0m   / ___/ _ \\|  _ \\_ _|  / \\   
  \x1b[47m  \x1b[0m    \x1b[102m  \x1b[0m  | |  | | | | |_) | |  / _ \\  
  \x1b[47m  \x1b[0m    \x1b[102m  \x1b[0m  | |__| |_| |  __/| | / ___ \\ 
  \x1b[47m      \x1b[0m     \\____\\___/|_|  |___/_/   \\_\\


    ___   __________     ___      _______  ________
   /   | / ____/ __ \\   |__ \\    /_  __/ |/ /_  __/
  / /| |/ /   / / / /   __/ /     / /  |   / / /   
 / ___ / /___/ /_/ /   / __/     / /  /   | / /    
/_/  |_\\____/_____/   /____/    /_/  /_/|_|/_/
`;

function main() {
  console.log(banner);
  const argv = yargs(hideBin(process.argv))
    .usage("acd2txt <filepath> [options]")
    .positional("filepath", {
      describe: "Path to the ACD file",
      type: "string",
      required: true,
    })
    .option("output", {
      alias: "o",
      describe: "if specified, output text will be saved to this filepath",
      type: "string",
      required: true,
    })
    .help()
    .alias("help", "h")
    .parseSync();
  if (argv._[0] === undefined) {
    console.error("No ACD filepath specified");
    process.exit(1);
  }
  const fname = argv._[0] as string;
  if (!fs.existsSync(fname)) {
    console.error(`File ${fname} does not exist`);
    process.exit(1);
  }

  console.log(`Reading ${fname}...`);
  let outpath = argv.output as string;
  let { dir } = path.parse(path.resolve(outpath));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  renderFile(fname)
    .then((str) => {
      fs.writeFileSync(outpath, str);
      console.log(`Complete. Output saved to ${outpath}`);
    })
    .catch((err) => {
      console.error(`Error rendering file: ${err.message}`);
      process.exit(1);
    });
}

async function renderFile(fname: string): Promise<string> {
  let ret = "";

  const buffer = fs.readFileSync(fname);
  const parsedFile = parseAcd(buffer.buffer, fname);
  const programs = getAcdPrograms(parsedFile);
  for (let program of programs) {
    const routines = getAcdRoutines(parsedFile, program);
    for (let routine of routines) {
      ret += `Program: ${program.name} > Routine: ${routine.name}\n\n`;
      const rungs = getAcdRungs(parsedFile, routine);
      if (rungs.length === 0) {
        ret += "  No rungs in this routine\n\n";
      }
      for (let rung of rungs) {
        const neutralText = translateTagReferences(parsedFile, rung.rung);
        const rungData = {
          rungNum: (rung.rungNum + 1).toString(),
          rung: parseNeutralText(neutralText),
        };
        const rungRender = await layoutAndRenderRung(rungData);
        ret += rungRender.join("\n") + "\n\n";
      }
    }
  }
  const aois = getAcdAOIs(parsedFile);
  for (let aoi of aois) {
    const routines = getAcdRoutines(parsedFile, aoi);
    for (let routine of routines) {
      ret += `AOI: ${aoi.name} Routine: ${routine.name}\n\n`;
      const rungs = getAcdRungs(parsedFile, routine);
      if (rungs.length === 0) {
        ret += "  No rungs in this routine\n\n";
      }
      for (let rung of rungs) {
        const neutralText = translateTagReferences(parsedFile, rung.rung);
        const rungData = {
          rungNum: (rung.rungNum + 1).toString(),
          rung: parseNeutralText(neutralText),
        };
        const rungRender = await layoutAndRenderRung(rungData);
        ret += rungRender.join("\n") + "\n\n";
      }
    }
  }
  return ret;
}

main();
