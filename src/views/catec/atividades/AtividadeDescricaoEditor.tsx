'use client'

import { useEffect, useState } from 'react'
import type { MouseEvent as ReactMouseEvent } from 'react'

import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import classnames from 'classnames'
import { Placeholder } from '@tiptap/extension-placeholder'
import { TextAlign } from '@tiptap/extension-text-align'
import { Underline } from '@tiptap/extension-underline'
import type { Editor } from '@tiptap/react'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

import CustomIconButton from '@core/components/mui/IconButton'

import '@/libs/styles/tiptapEditor.css'
import styles from './styles.module.css'

type Props = {
  value: string | null
  disabled?: boolean
  salvando?: boolean
  onSalvar?: (html: string | null) => Promise<void>
  /** Editor sempre aberto, sem Salvar/Cancelar — para formulários (ex.: Nova atividade). */
  modoFormulario?: boolean
  /** Altura de conteúdo menor, para modais compactos. */
  compacto?: boolean
  onChange?: (html: string | null) => void
}

type ElementoInserivel = {
  id: string
  titulo: string
  descricao: string
  icone: string
  atalho?: string
  inserir: (editor: Editor) => void
}

function escaparHtml(texto: string): string {
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function paraConteudoEditor(value: string | null): string {
  if (!value?.trim()) return ''

  if (/<[a-z][\s\S]*>/i.test(value)) return value

  return `<p>${escaparHtml(value).replace(/\n/g, '<br>')}</p>`
}

function htmlVazio(html: string): boolean {
  const limpo = html.replace(/\s/g, '')

  return !limpo || limpo === '<p></p>' || limpo === '<p><br></p>' || limpo === '<p><br/></p>'
}

function temEstrutura(html: string): boolean {
  return /<(hr|ul|ol|h[1-6]|blockquote|pre|li)\b/i.test(html)
}

function normalizarDescricao(html: string): string | null {
  if (htmlVazio(html)) return null

  const texto = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!texto && !temEstrutura(html)) return null

  return html
}

function temConteudoVisivel(value: string | null): boolean {
  if (!value?.trim()) return false

  return normalizarDescricao(value) != null
}

const ELEMENTOS: ElementoInserivel[] = [
  {
    id: 'h1',
    titulo: 'Título 1',
    descricao: 'Título principal da seção',
    icone: 'tabler-h-1',
    atalho: '#',
    inserir: editor => editor.chain().focus().toggleHeading({ level: 1 }).run()
  },
  {
    id: 'h2',
    titulo: 'Título 2',
    descricao: 'Subtítulo',
    icone: 'tabler-h-2',
    atalho: '##',
    inserir: editor => editor.chain().focus().toggleHeading({ level: 2 }).run()
  },
  {
    id: 'h3',
    titulo: 'Título 3',
    descricao: 'Título menor',
    icone: 'tabler-h-3',
    atalho: '###',
    inserir: editor => editor.chain().focus().toggleHeading({ level: 3 }).run()
  },
  {
    id: 'bullet',
    titulo: 'Lista com marcadores',
    descricao: 'Criar uma lista com bullets',
    icone: 'tabler-list',
    atalho: '-',
    inserir: editor => editor.chain().focus().toggleBulletList().run()
  },
  {
    id: 'ordered',
    titulo: 'Lista numerada',
    descricao: 'Criar uma lista numerada',
    icone: 'tabler-list-numbers',
    atalho: '1.',
    inserir: editor => editor.chain().focus().toggleOrderedList().run()
  },
  {
    id: 'quote',
    titulo: 'Citação',
    descricao: 'Destacar um trecho citado',
    icone: 'tabler-blockquote',
    atalho: '>',
    inserir: editor => editor.chain().focus().toggleBlockquote().run()
  },
  {
    id: 'hr',
    titulo: 'Divisória',
    descricao: 'Inserir uma linha separadora',
    icone: 'tabler-separator',
    atalho: '---',
    inserir: editor => editor.chain().focus().setHorizontalRule().run()
  },
  {
    id: 'code',
    titulo: 'Bloco de código',
    descricao: 'Trecho de código formatado',
    icone: 'tabler-code',
    atalho: '```',
    inserir: editor => editor.chain().focus().toggleCodeBlock().run()
  }
]

const EditorToolbar = ({ editor }: { editor: Editor | null }) => {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null)
  const [estiloAnchor, setEstiloAnchor] = useState<HTMLElement | null>(null)

  const editorState = useEditorState({
    editor,
    selector: ctx => {
      if (!ctx.editor) {
        return {
          isBold: false,
          isItalic: false,
          isUnderline: false,
          isStrike: false,
          isBulletList: false,
          isOrderedList: false,
          isH1: false,
          isH2: false,
          isH3: false,
          isParagraph: true
        }
      }

      return {
        isBold: ctx.editor.isActive('bold') ?? false,
        isItalic: ctx.editor.isActive('italic') ?? false,
        isUnderline: ctx.editor.isActive('underline') ?? false,
        isStrike: ctx.editor.isActive('strike') ?? false,
        isBulletList: ctx.editor.isActive('bulletList') ?? false,
        isOrderedList: ctx.editor.isActive('orderedList') ?? false,
        isH1: ctx.editor.isActive('heading', { level: 1 }) ?? false,
        isH2: ctx.editor.isActive('heading', { level: 2 }) ?? false,
        isH3: ctx.editor.isActive('heading', { level: 3 }) ?? false,
        isParagraph: ctx.editor.isActive('paragraph') ?? false
      }
    }
  })

  if (!editor || !editorState) return null

  const rotuloEstilo = editorState.isH1
    ? 'Título 1'
    : editorState.isH2
      ? 'Título 2'
      : editorState.isH3
        ? 'Título 3'
        : 'Texto'

  const fecharMenu = () => setMenuAnchor(null)

  const inserirElemento = (item: ElementoInserivel) => {
    item.inserir(editor)
    fecharMenu()
  }

  return (
    <div className={styles.descricaoToolbar}>
      <CustomIconButton
        variant='tonal'
        size='small'
        color='primary'
        onClick={(e: ReactMouseEvent<HTMLElement>) => setMenuAnchor(e.currentTarget)}
        aria-label='Inserir elementos'
        title='Inserir elementos'
      >
        <i className='tabler-plus' />
      </CustomIconButton>

      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={fecharMenu}
        slotProps={{ paper: { className: styles.descricaoInsertMenu } }}
      >
        <Typography variant='caption' color='text.secondary' className={styles.descricaoInsertTitulo}>
          Inserir elementos
        </Typography>
        {ELEMENTOS.map(item => (
          <MenuItem key={item.id} onClick={() => inserirElemento(item)} className={styles.descricaoInsertItem}>
            <ListItemIcon>
              <i className={`${item.icone} text-xl`} />
            </ListItemIcon>
            <ListItemText
              primary={item.titulo}
              secondary={item.descricao}
              slotProps={{
                primary: { className: 'font-medium' },
                secondary: { className: 'text-xs' }
              }}
            />
            {item.atalho ? (
              <Typography variant='caption' color='text.disabled' className={styles.descricaoInsertAtalho}>
                {item.atalho}
              </Typography>
            ) : null}
          </MenuItem>
        ))}
      </Menu>

      <CustomIconButton
        variant='tonal'
        size='small'
        onClick={(e: ReactMouseEvent<HTMLElement>) => setEstiloAnchor(e.currentTarget)}
        aria-label='Estilo do texto'
        title={rotuloEstilo}
      >
        <i className='tabler-typography text-textSecondary' />
      </CustomIconButton>

      <Menu anchorEl={estiloAnchor} open={Boolean(estiloAnchor)} onClose={() => setEstiloAnchor(null)}>
        <MenuItem
          selected={editorState.isParagraph}
          onClick={() => {
            editor.chain().focus().setParagraph().run()
            setEstiloAnchor(null)
          }}
        >
          Texto normal
        </MenuItem>
        <MenuItem
          selected={editorState.isH1}
          onClick={() => {
            editor.chain().focus().toggleHeading({ level: 1 }).run()
            setEstiloAnchor(null)
          }}
        >
          Título 1
        </MenuItem>
        <MenuItem
          selected={editorState.isH2}
          onClick={() => {
            editor.chain().focus().toggleHeading({ level: 2 }).run()
            setEstiloAnchor(null)
          }}
        >
          Título 2
        </MenuItem>
        <MenuItem
          selected={editorState.isH3}
          onClick={() => {
            editor.chain().focus().toggleHeading({ level: 3 }).run()
            setEstiloAnchor(null)
          }}
        >
          Título 3
        </MenuItem>
      </Menu>

      <CustomIconButton
        {...(editorState.isBold && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().toggleBold().run()}
        aria-label='Negrito'
      >
        <i className={classnames('tabler-bold', { 'text-textSecondary': !editorState.isBold })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editorState.isItalic && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().toggleItalic().run()}
        aria-label='Itálico'
      >
        <i className={classnames('tabler-italic', { 'text-textSecondary': !editorState.isItalic })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editorState.isUnderline && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        aria-label='Sublinhado'
      >
        <i className={classnames('tabler-underline', { 'text-textSecondary': !editorState.isUnderline })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editorState.isStrike && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().toggleStrike().run()}
        aria-label='Tachado'
      >
        <i className={classnames('tabler-strikethrough', { 'text-textSecondary': !editorState.isStrike })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editorState.isBulletList && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        aria-label='Lista'
      >
        <i className={classnames('tabler-list', { 'text-textSecondary': !editorState.isBulletList })} />
      </CustomIconButton>
      <CustomIconButton
        {...(editorState.isOrderedList && { color: 'primary' })}
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        aria-label='Lista numerada'
      >
        <i className={classnames('tabler-list-numbers', { 'text-textSecondary': !editorState.isOrderedList })} />
      </CustomIconButton>
      <CustomIconButton
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
        aria-label='Desfazer'
      >
        <i className='tabler-arrow-back-up text-textSecondary' />
      </CustomIconButton>
      <CustomIconButton
        variant='tonal'
        size='small'
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
        aria-label='Refazer'
      >
        <i className='tabler-arrow-forward-up text-textSecondary' />
      </CustomIconButton>
    </div>
  )
}

const AtividadeDescricaoEditor = ({
  value,
  disabled = false,
  salvando = false,
  onSalvar,
  modoFormulario = false,
  compacto = false,
  onChange
}: Props) => {
  const [editando, setEditando] = useState(modoFormulario)
  const [persistindo, setPersistindo] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] }
      }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({
        placeholder: 'Adicionar descrição… Digite # para título ou use o botão +'
      })
    ],
    immediatelyRender: false,
    editable: !disabled && (modoFormulario || false),
    content: paraConteudoEditor(value),
    onUpdate: ({ editor: ed }) => {
      if (!modoFormulario) return

      onChange?.(normalizarDescricao(ed.getHTML()))
    }
  })

  useEffect(() => {
    if (!editor || editando || modoFormulario) return

    const atual = paraConteudoEditor(value)
    const noEditor = editor.getHTML()

    if (normalizarDescricao(noEditor) !== normalizarDescricao(atual)) {
      editor.commands.setContent(atual, { emitUpdate: false })
    }
  }, [editor, value, editando, modoFormulario])

  useEffect(() => {
    if (!editor) return

    editor.setEditable(!disabled && (modoFormulario || editando))
  }, [editor, disabled, editando, modoFormulario])

  const iniciarEdicao = () => {
    if (disabled || !editor) return

    editor.commands.setContent(paraConteudoEditor(value), { emitUpdate: false })
    setEditando(true)
    queueMicrotask(() => editor.commands.focus('end'))
  }

  const cancelar = () => {
    if (!editor || modoFormulario) return

    editor.commands.setContent(paraConteudoEditor(value), { emitUpdate: false })
    setEditando(false)
  }

  const salvar = async () => {
    if (!editor || persistindo || salvando || !onSalvar) return

    const html = normalizarDescricao(editor.getHTML())

    setPersistindo(true)

    try {
      await onSalvar(html)
      setEditando(false)
    } finally {
      setPersistindo(false)
    }
  }

  if (!editando && !modoFormulario) {
    return (
      <section className={styles.descricaoSecao}>
        <h2 className={styles.descricaoCampoTitulo}>Descrição</h2>
        <button
          type='button'
          className={styles.descricaoPreview}
          onClick={iniciarEdicao}
          disabled={disabled}
        >
          {temConteudoVisivel(value) ? (
            <div
              className={styles.descricaoHtml}
              dangerouslySetInnerHTML={{ __html: paraConteudoEditor(value) }}
            />
          ) : (
            <Typography variant='body2' color='text.disabled' className={styles.descricaoPlaceholder}>
              Clique para adicionar uma descrição...
            </Typography>
          )}
        </button>
      </section>
    )
  }

  return (
    <section className={styles.descricaoSecao}>
      <h2 className={styles.descricaoCampoTitulo}>Descrição</h2>
      <div className={compacto ? `${styles.descricaoEditor} ${styles.descricaoEditorCompacto}` : styles.descricaoEditor}>
        <EditorToolbar editor={editor} />
        <Divider />
        <EditorContent editor={editor} className={styles.descricaoEditorContent} />
        {!modoFormulario ? (
          <div className={styles.descricaoAcoes}>
            <Button
              variant='contained'
              size='small'
              onClick={() => void salvar()}
              disabled={persistindo || salvando}
            >
              Salvar
            </Button>
            <Button
              variant='text'
              color='secondary'
              size='small'
              onClick={cancelar}
              disabled={persistindo || salvando}
            >
              Cancelar
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  )
}

export default AtividadeDescricaoEditor
