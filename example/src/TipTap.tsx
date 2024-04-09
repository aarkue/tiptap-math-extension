import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { MathExtension } from "../../packages/tiptap-math-extension/src/index";
import "katex/dist/katex.min.css";
import { useEffect } from "react";

const Tiptap = () => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      MathExtension.configure({ evaluation: false, katexOptions: { macros: { "\\B": "\\mathbb{B}" } } }),
    ],
    content: "<p>Hello World!</p>",
  });

  useEffect(() => {
    if(editor){
      console.log({editor});
      (window as any).tiptapEditor = editor;
    }
  },[editor])
  return <EditorContent editor={editor} className="tiptap-editor"  />;
};

export default Tiptap;
