# Math/LaTeX Extension for the TipTap Editor

Use inline math expression / LaTeX directly in your editor!

## Usage

See the demo at `/example` for a quick introduction on how to use this package.
The **package is now available on NPM** as [**@aarkue/tiptap-math-extension**](https://www.npmjs.com/package/@aarkue/tiptap-math-extension).
It can be installed using `npm install @aarkue/tiptap-math-extension`.

To correctly render the LaTeX expressions, you will also need to include the **KaTeX CSS**.
If you are using [vite](https://vitejs.dev/) you can use `import "katex/dist/katex.min.css";` in the component which renders the tiptap editor.
This requires that you also install the `katex` npm package using `npm i katex` (https://www.npmjs.com/package/katex).
There are also different ways to include the CSS, for instance by using a CDN like `jsdelivr.net`. See https://katex.org/docs/browser for more information. Note, however, that only the CSS needs to be included manually as the JS is already bundled with this plugin.

## Features

### Display Inline LaTeX

Writing a math expression delimetered with `$`-signs automatically creates a rendered LaTeX expression.

To edit or delete the LaTeX, simply press backspace with the cursor places before the expression.
The rendered LaTeX will disappear and the LaTeX source will become normal editable text again.

### Evaluate LaTeX Expression

**Note: Since version 1.2.0 this feature needs to be explicitly enabled**.
This can be done using the `evaluate` configuration option:

```typescript
const editor = useEditor({
  extensions: [StarterKit, MathExtension.configure({ evaluation: true })],
  content: "<p>Hello World!</p>",
});
```

Calculation results can be shown inline, using the [Evaluatex.js]([https://arthanzel.github.io/evaluatex/) library.

Define variables using the `:=` notation (e.g., `x := 120`).
Then, expressions can include this variable (e.g., `x \cdot 4=`).
End the calculating expressions with `=` to automatically show the computed result.

## Screenshots + Demo

Try out the demo directly online at [https://aarkue.github.io/tiptap-math-extension/](https://aarkue.github.io/tiptap-math-extension/)!

![2023-06-03_16-05](https://github.com/aarkue/tiptap-math-extension/assets/20766652/3f5cc6d5-f0eb-4c2a-9ba7-87367cfdf119)

![2023-06-03_16-05_1](https://github.com/aarkue/tiptap-math-extension/assets/20766652/a722b978-06ef-48c0-8aa0-ba9bedff58a1)

https://github.com/aarkue/tiptap-math-extension/assets/20766652/96f31846-d4a8-4cb2-b963-ff6da57daeb1

## Options

There are a few options available to configure the extension. See below for typescript definitions of all available options and their default value.

```typescript
export interface MathExtensionOption {
  /** Evaluate LaTeX expressions */
  evaluation: boolean;
  /** Add InlineMath node type (currently required as inline is the only supported mode) */
  addInlineMath: boolean;
  /** KaTeX options to use for evaluation, see also https://katex.org/docs/options.html */
  katexOptions?: KatexOptions;
}
export const DEFAULT_OPTIONS = { addInlineMath: true, evaluation: false };
```

See https://katex.org/docs/options.html for a complete list of the available KaTeX options.

## Related or Used Projects

- [Tiptap Editor](https://github.com/ueberdosis/tiptap): The extensible editor for which this is an extension.
- [KaTeX](https://github.com/KaTeX/KaTeX): A LaTeX rendering engine for the web, used to render LaTeX expressions.
- [Evaluatex.js](https://github.com/arthanzel/evaluatex): Used to evaluate LaTeX expressions to a numeric value (e.g., `1 + (2 \cdot 3) = 7`).
- [Vite](https://github.com/vitejs/vite): Used to serve the example demo project.
