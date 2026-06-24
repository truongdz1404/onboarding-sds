'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { cn } from '@/lib/utils'

function ToolbarBtn({
  onClick,
  active,
  children,
  title,
}: {
  onClick: () => void
  active?: boolean
  children: React.ReactNode
  title?: string
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      className={cn(
        'flex h-8 w-8 items-center justify-center rounded text-[13px] font-semibold transition-colors',
        active
          ? 'bg-gray-200 text-gray-900'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
      )}
    >
      {children}
    </button>
  )
}

interface RichEditorProps {
  onChange?: (html: string) => void
  placeholder?: string
  className?: string
  toolbarPosition?: 'top' | 'bottom'
  onImageClick?: () => void
  onVideoClick?: () => void
  defaultValue?: string
}

export function RichEditor({
  onChange,
  placeholder = 'Nội dung bài viết...',
  className,
  toolbarPosition = 'top',
  onImageClick,
  onVideoClick,
  defaultValue = '',
}: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-primary underline' } }),
      Placeholder.configure({ placeholder }),
    ],
    content: defaultValue,
    editorProps: {
      attributes: { class: 'prosemirror-editor focus:outline-none' },
    },
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML())
    },
  })

  if (!editor) return null

  function addLink() {
    const url = window.prompt('Nhập URL:')
    if (!url) return
    if (editor!.state.selection.empty) {
      editor!.chain().focus().insertContent(`<a href="${url}">${url}</a>`).run()
    } else {
      editor!.chain().focus().setLink({ href: url }).run()
    }
  }

  const toolbar = (
    <div className={cn(
      'flex items-center gap-0.5 px-4 py-2.5',
      toolbarPosition === 'top' ? 'border-b border-[#e5e7eb]' : 'border-t border-[#e5e7eb]',
    )}>
      <ToolbarBtn title="Đậm" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
        <span className="font-bold">B</span>
      </ToolbarBtn>
      <ToolbarBtn title="Nghiêng" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
        <span className="italic font-serif">I</span>
      </ToolbarBtn>

      <div className="mx-1.5 h-5 w-px bg-[#e5e7eb]" />

      <ToolbarBtn title="Danh sách số" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-4">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10 6h11M10 12h11M10 18h11M4 6h.01M4 12h.01M4 18h.01" />
        </svg>
      </ToolbarBtn>
      <ToolbarBtn title="Danh sách chấm" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-4">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 6h12M9 12h12M9 18h12M5 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm0 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm0 6a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" />
        </svg>
      </ToolbarBtn>

      <div className="mx-1.5 h-5 w-px bg-[#e5e7eb]" />

      <ToolbarBtn title="Link" onClick={addLink} active={editor.isActive('link')}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-4">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.828 10.172a4 4 0 0 0-5.656 0l-4 4a4 4 0 1 0 5.656 5.656l1.102-1.101m-.758-4.899a4 4 0 0 0 5.656 0l4-4a4 4 0 0 0-5.656-5.656l-1.1 1.1" />
        </svg>
      </ToolbarBtn>
      <ToolbarBtn title="Code" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-4">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m16 18 4-4-4-4M8 6 4 10l4 4" />
        </svg>
      </ToolbarBtn>
      <ToolbarBtn title="Trích dẫn" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-4">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
        </svg>
      </ToolbarBtn>

      <div className="mx-1.5 h-5 w-px bg-[#e5e7eb]" />

      <ToolbarBtn title="Code block" onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-4">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10 20H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4m-6 8h8m0 0-2-2m2 2-2 2M14 16h2" />
        </svg>
      </ToolbarBtn>

      {(onImageClick || onVideoClick) && <div className="mx-1.5 h-5 w-px bg-[#e5e7eb]" />}

      {onImageClick && (
        <ToolbarBtn title="Thêm ảnh" onClick={onImageClick}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-4">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m21 15-5-5L5 21M3 3h18a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm6.5 6.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
          </svg>
        </ToolbarBtn>
      )}

      {onVideoClick && (
        <ToolbarBtn title="Thêm video" onClick={onVideoClick}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="size-4">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="m15 10 4.553-2.276A1 1 0 0 1 21 8.723v6.554a1 1 0 0 1-1.447.894L15 14M3 8a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V8Z" />
          </svg>
        </ToolbarBtn>
      )}
    </div>
  )

  return (
    <div className={cn('rounded-xl border border-[#e5e7eb] bg-white', className)}>
      {toolbarPosition === 'top' && toolbar}
      <EditorContent editor={editor} className="min-h-[200px] px-5 py-4 text-[15px] text-gray-800" />
      {toolbarPosition === 'bottom' && toolbar}
    </div>
  )
}
