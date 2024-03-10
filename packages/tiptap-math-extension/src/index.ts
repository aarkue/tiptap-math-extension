import { Extension } from "@tiptap/core";

import { InlineMathNode } from "./inline-math-node";

export interface MathExtensionOption {
  evaluation: boolean; // Evaluate LaTeX expressions
  addInlineMath: boolean; // Add InlineMath node type (currently required as inline is the only supported mode)
}
export const DEFAULT_OPTIONS = { addInlineMath: true, evaluation: false };
export const MATH_EXTENSION_NAME = "mathExtension";
export const MathExtension = Extension.create<MathExtensionOption>({
  name: MATH_EXTENSION_NAME,

  addOptions() {
    return DEFAULT_OPTIONS;
  },

  addExtensions() {
    const extensions = [];
    if (this.options.addInlineMath !== false) {
      extensions.push(InlineMathNode.configure(this.options));
    }

    return extensions;
  },
});

export { InlineMathNode };

export default MathExtension;
