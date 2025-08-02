'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import { FaBold, FaItalic, FaUnderline, FaStrikethrough, FaListUl, FaListOl, FaAlignLeft, FaAlignCenter, FaAlignRight, FaLink, FaHeading } from 'react-icons/fa';
import { useState, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  return (
    <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1 bg-gray-50">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-300' : ''}`}
        title="Bold"
      >
        <FaBold className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-300' : ''}`}
        title="Italic"
      >
        <FaItalic className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('underline') ? 'bg-gray-300' : ''}`}
        title="Underline"
      >
        <FaUnderline className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('strike') ? 'bg-gray-300' : ''}`}
        title="Strikethrough"
      >
        <FaStrikethrough className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : ''}`}
        title="Heading 1"
      >
        <FaHeading className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''}`}
        title="Heading 2"
      >
        <FaHeading className="w-3 h-3" />
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-300' : ''}`}
        title="Bullet List"
      >
        <FaListUl className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-300' : ''}`}
        title="Numbered List"
      >
        <FaListOl className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      <button
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : ''}`}
        title="Align Left"
      >
        <FaAlignLeft className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : ''}`}
        title="Align Center"
      >
        <FaAlignCenter className="w-4 h-4" />
      </button>
      <button
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300' : ''}`}
        title="Align Right"
      >
        <FaAlignRight className="w-4 h-4" />
      </button>
      
      <div className="w-px h-6 bg-gray-300 mx-1"></div>
      
      <button
        onClick={() => {
          const url = window.prompt('Enter URL');
          if (url) {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
        className={`p-2 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'bg-gray-300' : ''}`}
        title="Add Link"
      >
        <FaLink className="w-4 h-4" />
      </button>
    </div>
  );
};

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      Strike,
    ],
    content: (() => {
      // Remove any image tags from the initial content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = value;
      const images = tempDiv.querySelectorAll('img');
      images.forEach(img => img.remove());
      return tempDiv.innerHTML;
    })(),
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[200px] p-4',
      },
    },
    immediatelyRender: false,
  });

  // Update editor content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      console.log('=== RICH TEXT EDITOR UPDATE ===');
      console.log('New value received:', value);
      console.log('Current editor content:', editor.getHTML());
      
      // Remove any image tags from the content before setting it
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = value;
      const images = tempDiv.querySelectorAll('img');
      images.forEach(img => img.remove());
      const cleanedContent = tempDiv.innerHTML;
      
      editor.commands.setContent(cleanedContent);
    }
  }, [editor, value]);

  if (!isMounted) {
    return (
      <div className="border border-gray-300 rounded-md overflow-hidden">
        <div className="border-b border-gray-200 p-2 flex flex-wrap gap-1 bg-gray-50">
          <div className="p-2 text-gray-400">Loading editor...</div>
        </div>
        <div className="min-h-[200px] p-4 bg-gray-50 flex items-center justify-center">
          <div className="text-gray-400">Loading rich text editor...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-md overflow-hidden">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      {placeholder && !editor?.getText() && (
        <div className="absolute top-0 left-0 p-4 text-gray-400 pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  );
} 