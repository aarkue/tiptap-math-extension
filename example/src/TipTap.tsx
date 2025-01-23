import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
// import { MathExtension } from "@aarkue/tiptap-math-extension";
import { MathExtension } from "../../packages/tiptap-math-extension/src/index";
import "katex/dist/katex.min.css";
import { useEffect } from "react";

const Tiptap = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      MathExtension.configure({ evaluation: true, katexOptions: { macros: { "\\B": "\\mathbb{B}" } }, delimiters: "dollar" }),
    ],
    content: `<p>Hello World!
      <br/>
      <br/>
      This is a sum: <span data-type="inlineMath" data-latex="\\sum_{i=0}^n i^2"></span>
      <br/>
      <br/>
      This is a block math expression:
      <br/>
      <span data-type="inlineMath" data-display="yes" data-evaluate="no" data-latex="\\sum_{i=0}^n i^2"></span>
      <br/>
      <br/>
      Cool, right?</p>`,
  });

  useEffect(() => {
    if (editor) {
      console.log({ editor });
      (window as any).tiptapEditor = editor;
    }
  }, [editor]);
  return (
    <div>
      <button
        onClick={() => {
          editor?.commands.insertContent({ type: "inlineMath", attrs: { latex: "x^2 = \\sqrt{x^4}" } });
        }}
      >
        Insert Math
      </button>
      <EditorContent editor={editor} className="tiptap-editor" />
    </div>
  );
};

export default Tiptap;
