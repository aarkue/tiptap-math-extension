import { Content, InputRule, mergeAttributes, Node, PasteRule } from "@tiptap/core";

import katex from "katex";
import evaluatex from "evaluatex/dist/evaluatex";
// import { v4 } from "uuid";

// This is not a secure/unpredictable ID, but this is simple and good enough for our case
function generateID() {
  // Note, that E is not included on purpose (to prevent any confusion with eulers number)
  const ALL_ALLOWED_CHARS_UPPER = [
    "A",
    "B",
    "C",
    "D",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ];
  const RAND_ID_LEN = 367;
  let id = "";
  for (let i = 1; i <= RAND_ID_LEN; i++) {
    const c = ALL_ALLOWED_CHARS_UPPER[Math.floor(Math.random() * ALL_ALLOWED_CHARS_UPPER.length)];
    if (Math.random() > 0.5) {
      id += c.toLowerCase();
    } else {
      id += c;
    }
  }
  return id;
  // Alternative: use uuidv4
  // return v4()
}
export type VariableUpdateListeners = { id: string; onUpdate: () => any }[] | undefined;

export type AllVariableUpdateListeners = Record<string, VariableUpdateListeners>;
export type MathVariable = { aliases: string[]; value: number };
export type MathVariables = Record<string, MathVariable>;

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
        // instead of "latex" attributes, use "data-latex"
        parseHTML: (element) => element.getAttribute("data-latex"),
        renderHTML: (attributes) => {
          return {
            "data-latex": attributes.latex,
          };
        },
      },
      evaluate: {
        default: "no",
        // instead of "latex" attributes, use "data-latex"
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
            // .deleteRange({ from: props.range.from, to: props.range.to })
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

      resultSpan.style.backgroundColor = "#a1f4b960";
      resultSpan.style.marginLeft = "2px";
      resultSpan.style.paddingRight = "2px";
      resultSpan.style.paddingLeft = "2px";
      resultSpan.style.borderRadius = "10px";
      resultSpan.classList.add("katex");
      let showEvalResult = node.attrs.evaluate === "yes";
      const id = generateID();
      let evalRes = evaluateExpression(
        latex,
        this.editor.storage.inlineMath.variables,
        this.editor.storage.inlineMath.variableListeners
      ); // Do not show if error occurs (in general, we probably want to make showing the result optional)
      const updateResultSpan = () => {
        if (evalRes?.result) {
          if (evalRes.result.toString().split(".")[1]?.length > 5) {
            resultSpan.innerText = "=" + evalRes.result.toFixed(4);
          } else {
            resultSpan.innerText = "=" + evalRes.result.toString();
          }
        } else {
          resultSpan.innerText = "=Error";
        }

        if (!showEvalResult) {
          resultSpan.style.display = "none";
        } else {
          resultSpan.style.display = "inline-block";
        }
      };
      updateResultSpan();
      if (evalRes?.variablesUsed) {
        for (const v of evalRes.variablesUsed) {
          // Register Listeners
          let listenersForV: VariableUpdateListeners = this.editor.storage.inlineMath.variableListeners[v];
          if (listenersForV == undefined) {
            listenersForV = [];
          }
          listenersForV.push({
            id: id,
            onUpdate: () => {
              {
                evalRes = evaluateExpression(
                  latex,
                  this.editor.storage.inlineMath.variables,
                  this.editor.storage.inlineMath.variableListeners
                );
                updateResultSpan();
              }
            },
          });
          this.editor.storage.inlineMath.variableListeners[v] = listenersForV;
        }
      }
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

function evaluateExpression(
  latex: string,
  variables: MathVariables,
  variableListeners: AllVariableUpdateListeners
):
  | {
      result: number | undefined;
      definedVariableID: string | undefined;
      variablesUsed: Set<string>;
    }
  | undefined {
  console.log({ latex, variables });
  try {
    const regex = /\\pi({})?/g;
    let changedLatex = latex.trim().replace(regex, " PI");
    let definesVariable = undefined;
    const assignmentRegex = /^(.*)\s*:=\s*/;
    const assRegexRes = assignmentRegex.exec(changedLatex);
    if (assRegexRes && assRegexRes[0]) {
      changedLatex = changedLatex.substring(assRegexRes[0].length);
      definesVariable = assRegexRes[1].trim();
    }
    const splitAtEq = changedLatex.split("=");
    changedLatex = splitAtEq[splitAtEq.length - 1];
    const variableObj: Record<string, number> = {};
    let definedVariableID = undefined;
    let aliases: string[] = [];
    if (definesVariable) {
      aliases = getVariableAliases(definesVariable);
    }
    changedLatex = getVariableName(changedLatex.replace("}", "} "));
    // console.log({ changedLatex });
    for (const id in variables) {
      const variable: MathVariable = variables[id];
      variableObj[id] = variable.value;
      for (const alias of variable.aliases) {
        // Replace all occurences of alias with id
        changedLatex = changedLatex.split(alias).join(id);
        for (const a of aliases) {
          if (alias === a) {
            definedVariableID = id;
          }
        }
      }
    }
    const res = evaluatex(changedLatex, {}, { latex: true });
    const usedVars: Set<string> = new Set(res.tokens.filter((t) => t.type === "SYMBOL").map((t) => t.value as string));
    const resNum = res(variableObj);

    if (definesVariable !== undefined) {
      if (definedVariableID === undefined) {
        console.log({ changedLatex, variableObj, definedVariableID, definesVariable });
        definedVariableID = generateID();
      }
      // Cyclic dependency! Fail early
      if (usedVars.has(definedVariableID)) {
        return undefined;
      }
      variables[definedVariableID] = {
        value: resNum,
        aliases: aliases,
      };
      const listeners: VariableUpdateListeners = variableListeners[definedVariableID];
      if (listeners != undefined) {
        for (const l of listeners) {
          l.onUpdate();
        }
      }
    }

    return {
      definedVariableID: definedVariableID,
      variablesUsed: usedVars,
      result: resNum,
    };
  } catch (e) {
    return undefined;
  }
}

function getVariableAliases(variable: string) {
  return [getVariableName(variable)];
}

function parseInnerVariablePart(variablePart: string): string {
  variablePart = variablePart.trim();
  let mode: "main" | "sub" | "sup" | "after" = "main";
  let depth = 0;
  let prevBackslash = false;
  let main = "";
  let sup = "";
  let sub = "";
  let after = "";
  let inCommand = false;
  for (const c of variablePart) {
    let writeC = true;
    if (c === "\\") {
      if (!prevBackslash && depth === 0) {
        inCommand = true;
      }
      prevBackslash = !prevBackslash;
    } else {
      prevBackslash = false;
    }
    if (c === " " && depth === 0) {
      inCommand = false;
    }
    if (!prevBackslash) {
      if (c === "_" && depth === 0 && mode === "main") {
        mode = "sub";
        writeC = false;
      }
      if (c === "^" && depth === 0 && mode === "main") {
        mode = "sup";
        writeC = false;
      }
      if (c === "{") {
        depth++;
      }
      if (c === "}") {
        depth--;
        if (depth === 0) {
          inCommand = false;
        }
      }
    }
    if (mode === "main" && c === " " && depth === 0) {
      mode = "after";
      writeC = false;
    }
    if (mode === "main" && c === "\\" && depth === 0 && main != "") {
      mode = "after";
    }
    if (writeC) {
      if (mode === "main") {
        main += c;
      } else if (mode === "sub") {
        sub += c;
      } else if (mode === "sup") {
        sup += c;
      } else if (mode === "after") {
        after += c;
      }
      // Unless in a "group" {...}, go back to main mode
      // or command
      if ((mode === "sub" || mode == "sup") && depth === 0 && !inCommand) {
        mode = "main";
      }
    }
  }
  if (sup.startsWith("{") && sup.endsWith("}")) {
    sup = sup.substring(1, sup.length - 1);
  }
  if (sub.startsWith("{") && sub.endsWith("}")) {
    sub = sub.substring(1, sub.length - 1);
  }
  const subpart = sub !== "" ? `_{${sub.trim()}}` : "";
  const suppart = sup !== "" ? `^{${sup.trim()}}` : "";
  const processedAfter = after !== "" ? " " + parseInnerVariablePart(after) : "";
  return `${main}${subpart}${suppart}${processedAfter}`;
}

function getVariableName(variablePart: string): string {
  variablePart = variablePart.trim();
  if (variablePart.startsWith("{") && variablePart.endsWith("}")) {
    return getVariableName(variablePart.substring(1, variablePart.length - 1));
  }
  const colorRegex = /(?![^\\])\\color{\w*}/g;
  if (colorRegex.test(variablePart)) {
    return getVariableName(variablePart.replace(colorRegex, " "));
  }

  const textColorRegex = /\\textcolor{\w*}/g;
  if (textColorRegex.test(variablePart)) {
    return getVariableName(variablePart.replace(textColorRegex, " "));
  }
  return parseInnerVariablePart(variablePart);
}
