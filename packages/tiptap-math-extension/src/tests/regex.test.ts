import { getRegexFromOptions } from "../inline-math-node";
import { DEFAULT_OPTIONS } from "../util/options";

const raw = String.raw;
test("Inline Dollar Math Regex", () => {
  const options = { ...DEFAULT_OPTIONS };
  options.delimiters = "dollar";
  const r = new RegExp(getRegexFromOptions("inline", options), "");
  expect(r.exec(raw`$x_1$`)[1]).toStrictEqual("x_1");
  expect(r.exec(raw`$x_2$`)[1]).toStrictEqual("x_2");
  expect(r.exec(raw`$\sum_{i=1}^n i$`)[1]).toStrictEqual(raw`\sum_{i=1}^n i`);
  expect(r.exec(raw`$x \cdot y$`)[1]).toStrictEqual(raw`x \cdot y`);
  expect(r.exec(raw`$x \cdot 4$`)[1]).toStrictEqual(raw`x \cdot 4`);
  expect(r.exec(raw`$4 \cdot x$`)[1]).toStrictEqual(raw`4 \cdot x`);
  expect(r.exec(raw`$4 \cdot 5$`)[1]).toStrictEqual(raw`4 \cdot 5`);
  expect(r.exec(raw`$\left( \frac{1}{2} \right)$`)[1]).toStrictEqual(raw`\left( \frac{1}{2} \right)`);
  expect(r.exec(raw`$\$$`)[1]).toStrictEqual(raw`\$`);
  expect(r.exec(raw`$1$`)[1]).toStrictEqual(raw`1`);
  // The below test case is, of course, not a wanted match, but we definetely want to have the second $ as part of the input!
  // This allows filtering based on the match (i.e., if it starts with $: return)
  expect(r.exec(raw`$$x_1$$`)).toStrictEqual(null);
  expect(r.exec(raw`$1.5$`)[1]).toStrictEqual(raw`1.5`);
  expect(r.exec(raw`$1.23456789$`)[1]).toStrictEqual(raw`1.23456789`);
  expect(r.exec(raw`One scoop is $2 and two are $3`)).toStrictEqual(null);
  expect(r.exec(raw`One scoop is 2$, and two are 3$`)).toStrictEqual(null);
  expect(r.exec(raw`$10 ($5)`)).toStrictEqual(null);
  expect(r.exec(raw`I have $120 ($40 from my allowance and $80 from the card Grandma sent me on my birthday).`)).toStrictEqual(null);
  // Here the danger is matching starting from the $120; We only want to match $40$!
  expect(r.exec(raw`I have $120 ($40$ from my allowance and $80 from the card Grandma sent me on my birthday).`)[1]).toStrictEqual(raw`40`);
  // ...or $80$
  expect(r.exec(raw`I have $120 ($40 from my allowance and $80$ from the card Grandma sent me on my birthday).`)[1]).toStrictEqual(raw`80`);
  expect(r.exec(raw`I have $\$120$ ($40 from my allowance and $80$ from the card Grandma sent me on my birthday).`)[1]).toStrictEqual(raw`\$120`);
  expect(r.exec(raw`I have $120 ($\$40$ from my allowance and $\$80$ from the card Grandma sent me on my birthday).`)[1]).toStrictEqual(raw`\$40`);
  expect(r.exec(raw`I have $120 ($40 from my allowance and $\$80$ from the card Grandma sent me on my birthday).`)[1]).toStrictEqual(raw`\$80`);

  expect(r.exec(raw`I gave Cynthia $5.00 and she said, "$5.00? That's really all you're good for?"`)).toStrictEqual(null);
  expect(r.exec('${"x"}$')[1]).toStrictEqual('{"x"}');

  // Tests with global regex (e.g., relevant for pasting) 
  const rg = new RegExp(getRegexFromOptions("inline", options), "g");
  expect([...raw`I have $\$120$ ($40$ from my allowance and $80$ from the card Grandma sent me on my birthday).`.match(rg)]).toStrictEqual([raw`$\$120$`,raw`$40$`,raw`$80$`]);
});

test("Display Dollar Math Regex", () => {
  const options = { ...DEFAULT_OPTIONS };
  options.delimiters = "dollar";
  const r = new RegExp(getRegexFromOptions("block", options), "");
  expect(r.exec(raw`$$x_1$$`)[1]).toStrictEqual("x_1");
  expect(r.exec(raw`$$x_2$$`)[1]).toStrictEqual("x_2");
  expect(r.exec(raw`$$\sum_{i=1}^n i$$`)[1]).toStrictEqual(raw`\sum_{i=1}^n i`);
  expect(r.exec(raw`$$x \cdot y$$`)[1]).toStrictEqual(raw`x \cdot y`);
  expect(r.exec(raw`$$x \cdot 4$$`)[1]).toStrictEqual(raw`x \cdot 4`);
  expect(r.exec(raw`$$4 \cdot x$$`)[1]).toStrictEqual(raw`4 \cdot x`);
  expect(r.exec(raw`$$4 \cdot 5$$`)[1]).toStrictEqual(raw`4 \cdot 5`);
  expect(r.exec(raw`$$\left( \frac{1}{2} \right)$$`)[1]).toStrictEqual(raw`\left( \frac{1}{2} \right)`);
  expect(r.exec(raw`$$\$$$`)[1]).toStrictEqual(raw`\$`);
  expect(r.exec(raw`$$1$$`)[1]).toStrictEqual(raw`1`);
  expect(r.exec(raw`$$1.5$$`)[1]).toStrictEqual(raw`1.5`);
  expect(r.exec(raw`$$1.23456789$$`)[1]).toStrictEqual(raw`1.23456789`);
  expect(r.exec(raw`One scoop is $2 and two are $3`)).toStrictEqual(null);
});

test("Inline Bracket Math Regex", () => {
  const options = { ...DEFAULT_OPTIONS };
  options.delimiters = "bracket";
  const r = new RegExp(getRegexFromOptions("inline", options), "");
  expect(r.exec(raw`\(x_1\)`)[1]).toStrictEqual("x_1");
  expect(r.exec(raw`\(x_2\)`)[1]).toStrictEqual("x_2");
  expect(r.exec(raw`\(\sum_{i=1}^n i\)`)[1]).toStrictEqual(raw`\sum_{i=1}^n i`);
  expect(r.exec(raw`\(x \cdot y\)`)[1]).toStrictEqual(raw`x \cdot y`);
  expect(r.exec(raw`\(x \cdot 4\)`)[1]).toStrictEqual(raw`x \cdot 4`);
  expect(r.exec(raw`\(4 \cdot x\)`)[1]).toStrictEqual(raw`4 \cdot x`);
  expect(r.exec(raw`\(4 \cdot 5\)`)[1]).toStrictEqual(raw`4 \cdot 5`);
  expect(r.exec(raw`\(\left( \frac{1}{2} \right)\)`)[1]).toStrictEqual(raw`\left( \frac{1}{2} \right)`);
  expect(r.exec(raw`\(\$\)`)[1]).toStrictEqual(raw`\$`);
  expect(r.exec(raw`\(1\)`)[1]).toStrictEqual(raw`1`);
  expect(r.exec(raw`\(1.5\)`)[1]).toStrictEqual(raw`1.5`);
  expect(r.exec(raw`\(1.23456789\)`)[1]).toStrictEqual(raw`1.23456789`);
  expect(r.exec(raw`Solve task a) and b)`)).toStrictEqual(null);
});

test("Display Bracket Math Regex", () => {
  const options = { ...DEFAULT_OPTIONS };
  options.delimiters = "bracket";
  const r = new RegExp(getRegexFromOptions("block", options), "");
  expect(r.exec(raw`\[x_1\]`)[1]).toStrictEqual("x_1");
  expect(r.exec(raw`\[x_2\]`)[1]).toStrictEqual("x_2");
  expect(r.exec(raw`\[\sum_{i=1}^n i\]`)[1]).toStrictEqual(raw`\sum_{i=1}^n i`);
  expect(r.exec(raw`\[x \cdot y\]`)[1]).toStrictEqual(raw`x \cdot y`);
  expect(r.exec(raw`\[x \cdot 4\]`)[1]).toStrictEqual(raw`x \cdot 4`);
  expect(r.exec(raw`\[4 \cdot x\]`)[1]).toStrictEqual(raw`4 \cdot x`);
  expect(r.exec(raw`\[4 \cdot 5\]`)[1]).toStrictEqual(raw`4 \cdot 5`);
  expect(r.exec(raw`\[\left( \frac{1}{2} \right)\]`)[1]).toStrictEqual(raw`\left( \frac{1}{2} \right)`);
  expect(r.exec(raw`\[\$\]`)[1]).toStrictEqual(raw`\$`);
  expect(r.exec(raw`\[1\]`)[1]).toStrictEqual(raw`1`);
  expect(r.exec(raw`\[1.5\]`)[1]).toStrictEqual(raw`1.5`);
  expect(r.exec(raw`\[1.23456789\]`)[1]).toStrictEqual(raw`1.23456789`);
  expect(r.exec(raw`Solve task a) and b)`)).toStrictEqual(null);
});
