import { Content, InputRule, mergeAttributes, Node, PasteRule } from "@tiptap/core";
import katex from "katex";
import {
  AllVariableUpdateListeners,
  MathVariables,
  VariableUpdateListeners,
} from "./latex-evaluation/evaluate-expression";
import { generateID } from "./util/generate-id";
import { updateEvaluation } from "./latex-evaluation/update-evaluation";
import { DEFAULT_OPTIONS, MathExtensionOption, MathExtensionOption as MathExtensionOptions } from "./util/options";

// Strongly type tiptap storage
declare module '@tiptap/core' {
    interface Storage {
      inlineMath: {
         variables: MathVariables;
          variableListeners: AllVariableUpdateListeners;
      }
    }
  }

export const InlineMathNode = Node.create<MathExtensionOptions>({
  name: "inlineMath",
  group: "inline",
  inline: true,
  selectable: true,
  atom: true,

  addOptions() {
    return DEFAULT_OPTIONS;
  },

  addAttributes() {
    return {
      latex: {
        default: "x_1",
        parseHTML: (element) => element.getAttribute("data-latex"),
        renderHTML: (attributes) => {
          return {
            "data-latex": attributes.latex,
          };
        },
      },
      evaluate: {
        default: "no",
        parseHTML: (element) => element.getAttribute("data-evaluate"),
        renderHTML: (attributes) => {
          return {
            "data-evaluate": attributes.evaluate,
          };
        },
      },
      display: {
        default: "no",
        parseHTML: (element) => element.getAttribute("data-display"),
        renderHTML: (attributes) => {
          return {
            "data-display": attributes.display,
          };
        },
      },
    };
  },

  addInputRules() {
    const inputRules = [];
    const blockRegex = getRegexFromOptions("block", this.options);
    if (blockRegex !== undefined) {
      inputRules.push(
        new InputRule({
          find: new RegExp(blockRegex, ""),
          handler: (props) => {
            let latex = props.match[1];
            if (props.match[1].length === 0) {
              return;
            }
            const showRes = latex.endsWith("=");
            if (showRes) {
              latex = latex.substring(0, latex.length - 1);
            }
            let content: Content = [
              {
                type: "inlineMath",
                attrs: { latex: latex, evaluate: showRes ? "yes" : "no", display: "yes" },
              },
            ];
            props
              .chain()
              .insertContentAt(
                {
                  from: props.range.from,
                  to: props.range.to,
                },
                content,
                { updateSelection: true }
              )
              .run();
          },
        })
      );
    }
    const inlineRegex = getRegexFromOptions("inline", this.options);
    if (inlineRegex !== undefined) {
      inputRules.push(
        new InputRule({
          find: new RegExp(inlineRegex, ""),
          handler: (props) => {
            if (props.match[1].length === 0) {
              return;
            }
            // TODO: Better handling, also for custom regexes
            // This prevents that $$x_1$ (a block expression in progress) is already captured by inline input rules
            if (
              (this.options.delimiters === undefined || this.options.delimiters === "dollar") &&
              (props.match[1].startsWith("$") || props.match[0].startsWith("$$"))
            ) {
              return;
            }
            let latex = props.match[1];
            latex = latex.trim();
            const showRes = latex.endsWith("=");
            if (showRes) {
              latex = latex.substring(0, latex.length - 1);
            }
            let content: Content = [
              {
                type: "inlineMath",
                attrs: { latex: latex, evaluate: showRes ? "yes" : "no", display: "no" },
              },
            ];
            props
              .chain()
              .insertContentAt(
                {
                  from: props.range.from,
                  to: props.range.to,
                },
                content,
                { updateSelection: true }
              )
              .run();
          },
        })
      );
    }
    return inputRules;
  },

  addPasteRules() {
    const pasteRules = [];
    const blockRegex = getRegexFromOptions("block", this.options);
    if (blockRegex !== undefined) {
      pasteRules.push(
        new PasteRule({
          find: new RegExp(blockRegex, "g"),
          handler: (props) => {
            const latex = props.match[1];
            props
              .chain()
              .insertContentAt(
                { from: props.range.from, to: props.range.to },
                [
                  {
                    type: "inlineMath",
                    attrs: { latex: latex, evaluate: "no", display: "yes" },
                  },
                ],
                { updateSelection: true }
              )
              .run();
          },
        })
      );
    }
    const inlineRegex = getRegexFromOptions("inline", this.options);
    if (inlineRegex !== undefined) {
      pasteRules.push(
        new PasteRule({
          find: new RegExp(inlineRegex, "g"),
          handler: (props) => {
            const latex = props.match[1];
            props
              .chain()
              .insertContentAt(
                { from: props.range.from, to: props.range.to },
                [
                  {
                    type: "inlineMath",
                    attrs: { latex: latex, evaluate: "no", display: "no" },
                  },
                ],
                { updateSelection: true }
              )
              .run();
          },
        })
      );
    }
    return pasteRules;
  },

  parseHTML() {
    return [
      {
        tag: `span[data-type="${this.name}"]`,
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    let latex = "x";
    if (node.attrs.latex && typeof node.attrs.latex == "string") {
      latex = node.attrs.latex;
    }
    return [
      "span",
      mergeAttributes(HTMLAttributes, {
        "data-type": this.name,
      }),
      getDelimiter(node.attrs.display === "yes" ? "block" : "inline", "start", this.options) +
      latex +
      getDelimiter(node.attrs.display === "yes" ? "block" : "inline", "end", this.options),
    ];
  },

  renderText({ node }) {
    if (this.options.renderTextMode === "none") {
      return "";
    }
    if (typeof this.options.renderTextMode === 'object' && "placeholder" in this.options.renderTextMode) {
      return this.options.renderTextMode.placeholder;
    }
    let latex = "x";
    if (node.attrs.latex && typeof node.attrs.latex == "string") {
      latex = node.attrs.latex;
    }
    // if ( this.options.renderTextMode === "raw-latex") {
    return latex;
    // }
    // TODO: Maybe re-enable the delimited-latex mode once there is a way to not re-trigger the input rule :(
    // if (this.options.renderTextMode === undefined || this.options.renderTextMode === "delimited-latex") {
    // const displayMode = node.attrs.display === "yes";
    // const firstDelimiter = getDelimiter(displayMode ? "block" : "inline", "start", this.options);
    // let secondDelimiter = getDelimiter(displayMode ? "block" : "inline", "end", this.options);
    // return firstDelimiter + latex + secondDelimiter;
    // }

  },

  addKeyboardShortcuts() {
    return {
      Backspace: () =>
        this.editor.commands.command(({ tr, state }) => {
          let isMention = false;
          const { selection } = state;
          const { empty, anchor } = selection;
          if (!empty) {
            return false;
          }
          state.doc.nodesBetween(anchor - 1, anchor, (node, pos) => {
            if (node.type.name === this.name) {
              isMention = true;
              const displayMode = node.attrs.display === "yes";
              const firstDelimiter = getDelimiter(displayMode ? "block" : "inline", "start", this.options);
              let secondDelimiter = getDelimiter(displayMode ? "block" : "inline", "end", this.options);
              secondDelimiter = secondDelimiter.substring(0, secondDelimiter.length - 1);
              tr.insertText(firstDelimiter + (node.attrs.latex || "") + secondDelimiter, pos, anchor);
            }
          });
          return isMention;
        }),
    };
  },

  addNodeView() {
    return ({ HTMLAttributes, node, getPos, editor }) => {
      const outerSpan = document.createElement("span");
      const span = document.createElement("span");
      outerSpan.appendChild(span);
      let latex = "x_1";
      if ("data-latex" in HTMLAttributes && typeof HTMLAttributes["data-latex"] === "string") {
        latex = HTMLAttributes["data-latex"];
      }
      let displayMode = node.attrs.display === "yes";
      katex.render(latex, span, {
        displayMode: displayMode,
        throwOnError: false,
        ...(this.options.katexOptions ?? {}),
      });

      outerSpan.classList.add("tiptap-math", "latex");

      let showEvalResult = node.attrs.evaluate === "yes";
      const id = generateID();

      const shouldEvaluate = this.options.evaluation;
      // Should evaluate (i.e., also register new variables etc.)
      if (shouldEvaluate) {
        outerSpan.title = "Click to toggle result";
        outerSpan.style.cursor = "pointer";
        const resultSpan = document.createElement("span");
        outerSpan.append(resultSpan);
        resultSpan.classList.add("tiptap-math", "result");
        resultSpan.classList.add("katex");
        const evalRes = updateEvaluation(latex, id, resultSpan, showEvalResult, this.editor.extensionStorage.inlineMath);
        // On click, update the evaluate attribute (effectively triggering whether the result is shown)
        outerSpan.addEventListener("click", (ev) => {
          if (editor.isEditable && typeof getPos === "function") {
            editor
              .chain()
              .command(({ tr }) => {
                const position = getPos();
                tr.setNodeAttribute(position, "evaluate", !showEvalResult ? "yes" : "no");
                return true;
              })
              .run();
          }
          ev.preventDefault();
          ev.stopPropagation();
          ev.stopImmediatePropagation();
        });

        return {
          dom: outerSpan,
          destroy: () => {
            if (evalRes?.variablesUsed) {
              // De-register listeners
              for (const v of evalRes.variablesUsed) {
                let listenersForV: VariableUpdateListeners = this.editor.storage.inlineMath.variableListeners[v];
                if (listenersForV == undefined) {
                  listenersForV = [];
                }
                this.editor.storage.inlineMath.variableListeners[v] = listenersForV.filter((l) => l.id !== id);
              }
            }
          },
        };
      } else {
        // Should not evaluate math expression (just display them)
        return {
          dom: outerSpan,
        };
      }
    };
  },

  addStorage(): {
    variables: MathVariables;
    variableListeners: AllVariableUpdateListeners;
  } {
    return {
      variables: {},
      variableListeners: {},
    };
  },
});

export function getRegexFromOptions(mode: "inline" | "block", options: MathExtensionOption): string | undefined {
  if (options.delimiters === undefined || options.delimiters === "dollar") {
    if (mode === "inline") {
      return String.raw`(?<!\$)\$(?![$\s,.])((?:[^$\\]|\\\$|\\)+?(?<![\\\s(["]))\$`;
    } else {
      return String.raw`\$\$(?!\s)(.*?(?<!\\))\$\$`;
    }
  } else if (options.delimiters === "bracket") {
    if (mode === "inline") {
      return String.raw`\\\((.*?[^\\])\\\)`;
    } else {
      return String.raw`\\\[(.*?[^\\])\\\]`;
    }
  } else {
    if (mode === "inline") {
      return options.delimiters.inlineRegex;
    } else {
      return options.delimiters.blockRegex;
    }
  }
}

function getDelimiter(mode: "inline" | "block", position: "start" | "end", options: MathExtensionOption) {
  if (options.delimiters === undefined || options.delimiters === "dollar") {
    if (mode === "inline") {
      return "$";
    } else {
      return "$$";
    }
  } else if (options.delimiters === "bracket") {
    if (mode === "inline") {
      if (position === "start") {
        return String.raw`\(`;
      } else {
        return String.raw`\)`;
      }
    } else {
      if (position === "start") {
        return String.raw`\[`;
      } else {
        return String.raw`\]`;
      }
    }
  } else {
    if (mode === "inline") {
      if (position === "start") {
        return options.delimiters.inlineStart ?? "$";
      } else {
        return options.delimiters.inlineEnd ?? "$";
      }
    } else {
      if (position === "start") {
        return options.delimiters.blockStart ?? "$$";
      } else {
        return options.delimiters.blockEnd ?? "$$";
      }
    }
  }
}
