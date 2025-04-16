import type { KatexOptions } from "katex";
export interface MathExtensionOption {
  /** Evaluate LaTeX expressions */
  evaluation: boolean;
  /** Add InlineMath node type (currently required as inline is the only supported mode) */
  addInlineMath: boolean;
  /** KaTeX options to use for evaluation, see also https://katex.org/docs/options.html */
  katexOptions?: KatexOptions;
  /** Delimiters to auto-convert. Per default dollar-style (`dollar`) ($x_1$ and $$\sum_i i$$) are used.
   *
   * The `bracket` option corresponds to `\(x_1\)` and `\[\sum_i i \]`.
   *
   * Alternatively, custom inline/block regexes can be used.
   * The inner math content is expected to be the match at index 1 (`props.match[1]`).
   */
  delimiters?:
    | "dollar"
    | "bracket"
    | {
        inlineRegex?: string;
        blockRegex?: string;
        inlineStart?: string;
        inlineEnd?: string;
        blockStart?: string;
        blockEnd?: string;
      };
      
  /** If and how to represent math nodes in the raw text output (e.g., `editor.getText()`)
   * 
   * - `"none"`: do not include in text at all
   * - `"raw-latex"`: include the latex source, without delimiters (e.g., `\frac{1}{n}`)
   * - `"delimited-latex"`: include the latex source with delimiters (e.g., `$\frac{1}{n}$`)
   * - `{placeholder: "[...]`"}: represent all math nodes as a fixed placeholder string (e.g., `[...]`)
   */
    renderTextMode?: "none"|"raw-latex"|"delimited-latex"|{placeholder: string},
}
export const DEFAULT_OPTIONS: MathExtensionOption = { addInlineMath: true, evaluation: false, delimiters: "dollar" };
