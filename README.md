# Math Extension for the TipTap Editor

Use inline math LaTeX directly in your editor!


## Usage
See the demo at `/example` for a quick introduction on how to use this package.
The __package is now available on NPM__ as [__@aarkue/tiptap-math-extension__](https://www.npmjs.com/package/@aarkue/tiptap-math-extension).
It can be installed using `npm install @aarkue/tiptap-math-extension`.

## Features
### Display Inline LaTeX
Writing a math expression delimetered with `$`-signs automatically creates a rendered LaTeX expression.

To edit or delete the LaTeX, simply press backspace with the cursor places before the expression.
The rendered LaTeX will disappear and the LaTeX source will become normal editable text again.
### Evaluate LaTeX Expression
Calculation results can be shown inline, using the [Evaluatex.js]([https://arthanzel.github.io/evaluatex/) library.

Define variables using the `:=` notation (e.g., `x := 120`).
Then, expressions can include this variable (e.g., `x \cdot 4=`).
End the calculating expressions with `=` to automatically show the computed result.

## Screenshots + Demo
Try out the demo directly online at [https://aarkue.github.io/tiptap-math-extension/](https://aarkue.github.io/tiptap-math-extension/)!

![2023-06-03_16-05](https://github.com/aarkue/tiptap-math-extension/assets/20766652/3f5cc6d5-f0eb-4c2a-9ba7-87367cfdf119)

![2023-06-03_16-05_1](https://github.com/aarkue/tiptap-math-extension/assets/20766652/a722b978-06ef-48c0-8aa0-ba9bedff58a1)


https://github.com/aarkue/tiptap-math-extension/assets/20766652/96f31846-d4a8-4cb2-b963-ff6da57daeb1

## Related or Used Projects
- [Tiptap Editor](https://github.com/ueberdosis/tiptap): The extensible editor for which this is an extension.
- [KaTeX](https://github.com/KaTeX/KaTeX): A LaTeX rendering engine for the web, used to render LaTeX expressions.
- [Evaluatex.js](https://github.com/arthanzel/evaluatex): Used to evaluate LaTeX expressions to a numeric value (e.g., `1 + (2 \cdot 3) = 7`).
- [Vite](https://github.com/vitejs/vite): Used to serve the example demo project.
