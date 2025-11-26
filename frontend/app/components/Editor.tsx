"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Typography from '@tiptap/extension-typography';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function TiptapEditor({ content, onChange }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Typography,
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl m-5 focus:outline-none text-black',
      },
    },
    onUpdate: ({ editor }) => {
      // For now we just return HTML. In the future we can convert to Markdown.
      // Note: Tiptap requires a separate package for Markdown export (tiptap-markdown)
      // For this prototype, we'll assume the parent component handles the string.
      onChange(editor.getText()); 
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-md p-2 bg-white min-h-[200px]">
      <EditorContent editor={editor} />
    </div>
  );
}

