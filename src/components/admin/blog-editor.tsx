"use client";

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { EditorContent, useEditor, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Link as LinkIcon, Image as ImageIcon, List, ListOrdered } from "lucide-react";

interface BlogEditorProps {
  content: string;
  onChange: (content: string) => void;
}

// Add SSR configuration
const editorConfig = {
  immediatelyRender: false, // Explicitly set to false for SSR
};

// Create a custom editor configuration
const createEditorConfig = (content: string, onChange: (html: string) => void) => ({
  ...editorConfig,
  extensions: [
    StarterKit.configure({
      heading: {
        levels: [1, 2, 3],
      },
    }),
    Link.configure({
      openOnClick: false,
    }),
    Image,
  ],
  content,
  editorProps: {
    attributes: {
      class: 'prose max-w-none focus:outline-none'
    }
  },
  onUpdate: ({ editor }: { editor: Editor }) => {
    onChange(editor.getHTML());
  },
  editable: true,
  autofocus: false,
  injectCSS: false,
  parseOptions: {
    preserveWhitespace: true,
  }
});

function EditorComponent({ content, onChange }: BlogEditorProps) {
  const [isMounted, setIsMounted] = useState(false);
  const editorConfig = createEditorConfig(content, onChange);
  const editor = useEditor({
    ...editorConfig,
    onCreate: () => {
      setIsMounted(true);
    }
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMounted(true);
    }
  }, []);

  if (!isMounted || !editor) {
    return <div className="border rounded-lg p-4 min-h-[200px]">Loading editor...</div>;
  }

  const handleToolbarClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  return (
    <div className="border rounded-lg" onClick={e => e.stopPropagation()}>
      <div className="border-b p-2 flex gap-2 bg-gray-50" onClick={e => e.stopPropagation()}>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={`tiptap-toolbar-button ${editor.isActive("bold") ? "bg-gray-200" : ""}`}
          onClick={(e) => handleToolbarClick(e, () => editor.chain().focus().toggleBold().run())}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={`tiptap-toolbar-button ${editor.isActive("italic") ? "bg-gray-200" : ""}`}
          onClick={(e) => handleToolbarClick(e, () => editor.chain().focus().toggleItalic().run())}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={`tiptap-toolbar-button ${editor.isActive("link") ? "bg-gray-200" : ""}`}
          onClick={(e) => handleToolbarClick(e, () => {
            e.preventDefault();
            const url = window.prompt("Enter the URL");
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          })}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="tiptap-toolbar-button"
          onClick={(e) => handleToolbarClick(e, () => {
            e.preventDefault();
            const url = window.prompt("Enter the image URL");
            if (url) {
              editor.chain().focus().setImage({ src: url }).run();
            }
          })}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={`tiptap-toolbar-button ${editor.isActive("bulletList") ? "bg-gray-200" : ""}`}
          onClick={(e) => handleToolbarClick(e, () => editor.chain().focus().toggleBulletList().run())}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={`tiptap-toolbar-button ${editor.isActive("orderedList") ? "bg-gray-200" : ""}`}
          onClick={(e) => handleToolbarClick(e, () => editor.chain().focus().toggleOrderedList().run())}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
      </div>
      <div className="relative">
        <EditorContent 
          editor={editor} 
          className="prose max-w-none p-4 min-h-[200px] focus:outline-none"
        />
      </div>
    </div>
  );
}

// Create a wrapper component that only renders on client side
const ClientSideEditor = dynamic(
  () => Promise.resolve(EditorComponent),
  { 
    ssr: false,
    loading: () => <div className="border rounded-lg p-4 min-h-[200px]">Loading editor...</div>
  }
);

// Export the wrapped component
export const BlogEditor = (props: BlogEditorProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="border rounded-lg p-4 min-h-[200px]">Loading editor...</div>;
  }

  return <ClientSideEditor {...props} />;
}; 