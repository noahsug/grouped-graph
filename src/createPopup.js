import './popup.css'

function createPopup() {
  const root = document.createElement('div')
  root.classList.add('popup')
  hide()

  function setData({ selected, nodes, highlightedLinks }) {
    clear(root)

    const highlighted = getHighlightedNodes({ selected, highlightedLinks })
    selected.children.forEach(child => {
      const row = document.createElement('div')
      row.classList.add('row')
      if (highlighted.has(child.name)) row.classList.add('highlight')
      row.innerHTML = child.name
      root.appendChild(row)
    })
  }

  function hide() {
    root.classList.add('hidden')
  }

  function show() {
    root.classList.remove('hidden')
  }

  function attach(container) {
    container.appendChild(root)
  }

  return { hide, show, setData, attach }
}

function clear(root) {
  while (root.firstChild) root.removeChild(root.firstChild)
}

function getHighlightedNodes({ selected, highlightedLinks }) {
  const highlighted = new Set()
  const parentLink = Array.from(highlightedLinks).find(
    link => link.target === selected
  )
  if (parentLink) {
    const parent = parentLink.source
    const selectedNames = new Set(selected.children.map(c => c.name))

    parent.children.forEach(child => {
      child.targets.forEach(target => {
        if (selectedNames.has(target)) {
          highlighted.add(target)
        }
      })
    })
  }

  return highlighted
}

export default createPopup
