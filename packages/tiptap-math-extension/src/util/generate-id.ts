// import { v4 } from "uuid";

// This is not a secure/unpredictable ID, but this is simple and good enough for our case
export function generateID() {
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
  const RAND_ID_LEN = 36;
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
