import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from 'prosemirror-state'
import { Decoration, DecorationSet } from 'prosemirror-view'

export interface CursorUser {
  id: string
  name: string
  color: string
  anchor: number
  head: number
}

const COLORS = ['#E85D04','#7209B7','#3A0CA3','#4361EE','#06D6A0','#F72585','#B5179E','#4CC9F0']

function getColor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h)
  return COLORS[Math.abs(h) % COLORS.length]!
}

const collabCursorKey = new PluginKey('collabCursor')

export const CollabCursor = Extension.create({
  name: 'collabCursor',

  addOptions() {
    return {
      users: [] as CursorUser[],
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: collabCursorKey,
        state: {
          init() { return DecorationSet.empty },
          apply(tr, set) {
            const users: CursorUser[] = tr.getMeta(collabCursorKey) ?? null
            if (users === null) return set.map(tr.mapping, tr.doc)

            const decorations: Decoration[] = []
            for (const user of users) {
              const pos = Math.min(user.head, tr.doc.content.size)
              if (pos < 0) continue

              // Cursor line
              const cursorEl = document.createElement('span')
              cursorEl.style.cssText = `
                border-left: 2px solid ${user.color};
                margin-left: -1px;
                pointer-events: none;
                position: relative;
                display: inline-block;
                height: 1.2em;
                vertical-align: text-bottom;
              `

              // Name label
              const label = document.createElement('span')
              label.textContent = user.name.split(' ')[0]!
              label.style.cssText = `
                position: absolute;
                top: -1.4em;
                left: -1px;
                background: ${user.color};
                color: white;
                font-size: 10px;
                font-weight: 600;
                padding: 1px 6px;
                border-radius: 3px 3px 3px 0;
                white-space: nowrap;
                font-family: DM Sans, sans-serif;
                pointer-events: none;
                opacity: 0;
                transition: opacity 0.2s;
              `
              label.className = `collab-cursor-label-${user.id}`
              cursorEl.appendChild(label)

              // Show label on hover
              cursorEl.addEventListener('mouseenter', () => { label.style.opacity = '1' })
              cursorEl.addEventListener('mouseleave', () => { label.style.opacity = '0' })

              // Always show label briefly when cursor moves
              label.style.opacity = '1'
              setTimeout(() => { label.style.opacity = '0' }, 1500)

              try {
                decorations.push(Decoration.widget(pos, cursorEl, { side: 1, key: user.id }))
              } catch {}
            }

            return DecorationSet.create(tr.doc, decorations)
          },
        },
        props: {
          decorations(state) { return collabCursorKey.getState(state) },
        },
      }),
    ]
  },
})

export function updateCursors(editor: any, users: CursorUser[]) {
  const { tr } = editor.state
  tr.setMeta(collabCursorKey, users)
  editor.view.dispatch(tr)
}
