# Math Extension for the TipTap Editor

Use inline math LaTeX expressions directly in your editor!

Uses KaTeX for rendering LaTeX.

See the demo at `/example` for a quick introduction on how to use this package.
There is currently no `npmjs.org` package published, but meanwhile, this extension can also be quickly installed from GitHub directly using `npm`. 

## Evaluate LaTeX Expression
Calculation results can be shown inline, using the [Evaluatex.js]([https://arthanzel.github.io/evaluatex/) library.

Define variables using the `:=` notation (e.g., `x := 120`).
Then, expressions can include this variable (e.g., `x \cdot 4=`).
End the calculating expressions with `=` to automatically show the computed result. 