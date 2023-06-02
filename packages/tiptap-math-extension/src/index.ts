import { Extension } from "@tiptap/core";

import { InlineMathNode } from "./inline-math-node";

export interface MathExtensionOption {
  evaluation: boolean;
  addInlineMath: boolean;
}

export const MathExtension = Extension.create<MathExtensionOption>({
  name: "mathExtension",

  addExtensions() {
    const extensions = [];
    if (this.options.addInlineMath !== false) {
      extensions.push(InlineMathNode);
    }

    return extensions;
  },
});

export { InlineMathNode };

export default MathExtension;
