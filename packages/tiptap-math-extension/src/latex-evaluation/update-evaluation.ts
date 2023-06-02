import { VariableUpdateListeners, evaluateExpression } from "./evaluate-expression";

export function updateEvaluation(latex: string, id: string, resultSpan: HTMLSpanElement, showEvalResult: boolean, editorStorage: any) {
  let evalRes = evaluateExpression(
    latex,
    editorStorage.variables,
    editorStorage.variableListeners
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
      let listenersForV: VariableUpdateListeners = editorStorage.variableListeners[v];
      if (listenersForV == undefined) {
        listenersForV = [];
      }
      listenersForV.push({
        id: id,
        onUpdate: () => {
          {
            evalRes = evaluateExpression(
              latex,
              editorStorage.variables,
              editorStorage.variableListeners
            );
            updateResultSpan();
          }
        },
      });
      editorStorage.variableListeners[v] = listenersForV;
    }
  }
  return evalRes;
}
