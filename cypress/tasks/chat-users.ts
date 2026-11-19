// A second chat user that runs in Node, outside the browser. Cypress drives one browser, so the
// Chat spec plays one user in the page and this module plays the other over a plain WebSocket
// (Node 22+ has a global WebSocket client). Registered as cy.task handlers in cypress.config.ts.

interface ChatEvent {
  type: 'message' | 'notice'
  author?: string
  text: string
}

interface ChatUser {
  socket: WebSocket
  received: ChatEvent[]
}

const users = new Map<string, ChatUser>()

function chatUrl(baseUrl: string, room: string) {
  const url = new URL(`/chat/socket?room=${encodeURIComponent(room)}`, baseUrl)
  url.protocol = url.protocol === 'https:'
    ? 'wss:'
    : 'ws:'
  return url.toString()
}

export function chatUserTasks(baseUrl: string) {
  return {
    /** Connect to the room and join with `name`; resolves once the server confirms the join. */
    chatUserJoin({ room, name }: { room: string, name: string }) {
      return new Promise<null>((resolve, reject) => {
        const socket = new WebSocket(chatUrl(baseUrl, room))
        const user: ChatUser = { socket, received: [] }
        users.set(name, user)
        socket.onmessage = (event) => {
          const data = JSON.parse(String(event.data)) as ChatEvent
          user.received.push(data)
          if (data.type === 'notice' && data.text === `${name} joined`)
            resolve(null)
        }
        socket.onopen = () => socket.send(JSON.stringify({ type: 'join', name }))
        socket.onerror = () => reject(new Error(`chat user ${name} could not connect`))
      })
    },

    chatUserSend({ name, text }: { name: string, text: string }) {
      users.get(name)!.socket.send(JSON.stringify({ type: 'message', text }))
      return null
    },

    /**
     * Resolves with the first event the Node user received (already, or within `timeout` ms) that
     * matches `event`. cy.task isn't retried like a query, so the waiting happens here.
     */
    chatUserWaitFor({ name, event, timeout = 4000 }: { name: string, event: ChatEvent, timeout?: number }) {
      const user = users.get(name)!
      const matches = (e: ChatEvent) => e.type === event.type && e.text === event.text && e.author === event.author
      return new Promise<ChatEvent>((resolve, reject) => {
        const started = Date.now()
        const check = () => {
          const found = user.received.find(matches)
          if (found)
            return resolve(found)
          if (Date.now() - started > timeout)
            return reject(new Error(`${name} did not receive ${JSON.stringify(event)} within ${timeout}ms`))
          setTimeout(check, 50)
        }
        check()
      })
    },

    chatUserLeave(name: string) {
      users.get(name)?.socket.close()
      users.delete(name)
      return null
    },
  }
}
