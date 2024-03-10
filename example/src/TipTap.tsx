import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { MathExtension } from "../../packages/tiptap-math-extension/src/index";
import "katex/dist/katex.min.css";

const Tiptap = () => {
  const editor = useEditor({
    extensions: [StarterKit, MathExtension.configure({evaluation: false})],
    content: "<p>Hello World!</p>",
  });

  return <EditorContent editor={editor} className="tiptap-editor"  />;
};

export default Tiptap;
