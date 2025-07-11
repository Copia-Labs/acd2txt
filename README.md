# acd2txt

This is a simple experimental tool that parses a Rockwell ACD file, extracts the ladder logic, and draws it in ASCII art using [Box-drawing characters](https://en.wikipedia.org/wiki/Box-drawing_characters) and writes it as a text file to disk. This is not production quality code and has only been very lightly tested and so it probably only works for a small subset of ACD files.

If you can share an ACD file that doesn't work properly, feel free to file it with an issue, but as this tool is experimental, we can't promise a timely response.

## Usage

```
acd2txt <filepath> [options]

Positionals:
  filepath  Path to the ACD file                                        [string]

Options:
      --version  Show version number                                   [boolean]
  -o, --output   if specified, output text will be saved to this filepath
                                                             [string] [required]
  -h, --help     Show help                                             [boolean]
```

## Development

This repository is incomplete. It does NOT include the ACD parsing dependency so you will not be able to build this yourself, but feel free to browse the code if you are interested in how it works.

This application is written in typescript and executable in node, if you use a tool like `tsx` or transpiled to JS using `pkgroll`. The build process isn't in this repository yet.

This repository includes a simple Rockwell "Neutral Text" parser which is implemented with a parser generator called [peggy](https://peggyjs.org) with an addon called [ts-pegjs](https://github.com/metadevpro/ts-pegjs). The peggy generation step isn't in this repository yet, but the output is included in the repo. I'm not certain that this language is officially called Neutral Text, but I've encountered a few Rockwell docs that seem to refer to it as such. Rockwell neutral text is also used in the L5X format, so this same parser should be applicable for anyone parsing L5X files.

Rendering layout is performed by a layout engine called [Yoga](https://www.yogalayout.dev/) from Facebook which is used in the React Native framework. The Yoga layout engine was originally written in C++ but has been compiled to webassembly so it's usable from JS both in the browser and from node.

After Yoga finishes calculating the dimensions and positions of all of the elements, the rendering is done with string replacement operations on an array of strings. the [renderUtils.ts](src/renderUtils.ts) file has the functions to do this.