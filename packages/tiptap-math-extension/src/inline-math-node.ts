import { Content, InputRule, mergeAttributes, Node, PasteRule } from "@tiptap/core";
import katex from "katex";
import {
  AllVariableUpdateListeners,
  MathVariables,
  VariableUpdateListeners,
} from "./latex-evaluation/evaluate-expression";
import { generateID } from "./util/generate-id";
import { updateEvaluation } from "./latex-evaluation/update-evaluation";

export const InlineMathNode = Node.create({
  name: "inlineMath",
  group: "inline",
  inline: true,
  selectable: false,
  atom: true,

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
    };
  },

  addInputRules() {
    return [
      new InputRule({
        find: new RegExp(`\\$([^\\s])([^$]*)\\$$`, ""),
        handler: (props) => {
          let latex = props.match[1] + props.match[2];
          const showRes = latex.endsWith("=");
          if (showRes) {
            latex = latex.substring(0, latex.length - 1);
          }
          let content: Content = [
            {
              type: "inlineMath",
              attrs: { latex: latex, evaluate: showRes ? "yes" : "no" },
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
      }),
    ];
  },

  addPasteRules() {
    return [
      new PasteRule({
        find: /\$((?:(?!\$).)*)\$/g,

        handler: (props) => {
          props
            .chain()
            .insertContentAt(
              { from: props.range.from, to: props.range.to },
              [
                {
                  type: "inlineMath",
                  attrs: { latex: props.match[1] },
                },
              ],
              { updateSelection: true }
            )
            .run();
        },
      }),
      new PasteRule({
        find: /\\\(((.|[\r\n])*?)\\\)/g,

        handler: (props) => {
          props
            .chain()
            .insertContentAt(
              { from: props.range.from, to: props.range.to },
              [
                {
                  type: "inlineMath",
                  attrs: { latex: props.match[1] },
                },
              ],
              { updateSelection: true }
            )
            .run();
        },
      }),
    ];
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
        "data-content-type": this.name,
      }),
      "$" + latex + "$",
    ];
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
              tr.insertText("$" + (node.attrs.latex || "") + "", pos, anchor);
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
      katex.render(latex, span, { displayMode: false, throwOnError: false });

      outerSpan.title = "Click to toggle result";
      outerSpan.style.cursor = "pointer";

      const resultSpan = document.createElement("span");
      outerSpan.append(resultSpan);
      resultSpan.classList.add("tiptap-math", "result");
      resultSpan.classList.add("katex");
      let showEvalResult = node.attrs.evaluate === "yes";
      const id = generateID();
      const evalRes = updateEvaluation(latex, id, resultSpan, showEvalResult, this.editor.storage.inlineMath);

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
          // Not sure yet, if we want this behavior:
          // This would delete the defined variable (if exists) when the math node is destroyed
          // additionally, the update function can be called (i do not like the UX so far)
          // if (prevID) {
          //   delete this.editor.storage.inlineMath.variables[prevID];
          //   const listeners =
          //     (this.editor.storage.inlineMath.variableListeners[
          //       prevID
          //     ] as MathUpdateListeners) ?? [];
          //   for (const l of listeners) {
          //     l.onUpdate();
          //   }
          // }
        },
      };
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
