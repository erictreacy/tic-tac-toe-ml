interface MCTSNode {
  state: number[]
  visits: number
  wins: number
  children: Map<number, MCTSNode>
  parent: MCTSNode | null
  action: number
  isFullyExpanded: boolean
  untriedActions: number[]
}

export class MonteCarloTreeSearch {
  private explorationConstant = Math.sqrt(2)
  private maxIterations = 500

  public getBestMove(board: number[], iterations: number = this.maxIterations): number {
    const root = this.createNode(board, null, -1)

    for (let i = 0; i < iterations; i++) {
      const leaf = this.select(root)
      const child = this.expand(leaf)
      const result = this.simulate(child || leaf)
      this.backpropagate(child || leaf, result)
    }

    return this.getBestChild(root, 0)?.action ?? -1
  }

  private createNode(state: number[], parent: MCTSNode | null, action: number): MCTSNode {
    return {
      state: [...state],
      visits: 0,
      wins: 0,
      children: new Map(),
      parent,
      action,
      isFullyExpanded: false,
      untriedActions: this.getAvailableActions(state),
    }
  }

  private getAvailableActions(state: number[]): number[] {
    return state.map((cell, index) => (cell === 0 ? index : -1)).filter((index) => index !== -1)
  }

  private select(node: MCTSNode): MCTSNode {
    while (node.isFullyExpanded && node.children.size > 0) {
      const bestChild = this.getBestChild(node, this.explorationConstant)
      if (!bestChild) break
      node = bestChild
    }
    return node
  }

  private expand(node: MCTSNode): MCTSNode | null {
    if (node.untriedActions.length === 0) {
      node.isFullyExpanded = true
      return null
    }

    const action = node.untriedActions.pop()!
    const newState = [...node.state]
    newState[action] = 1

    const child = this.createNode(newState, node, action)
    node.children.set(action, child)

    if (node.untriedActions.length === 0) {
      node.isFullyExpanded = true
    }

    return child
  }

  private simulate(node: MCTSNode): number {
    const state = [...node.state]
    let currentPlayer = 1

    while (!this.isTerminal(state)) {
      const actions = this.getAvailableActions(state)
      if (actions.length === 0) break

      const randomAction = actions[Math.floor(Math.random() * actions.length)]
      state[randomAction] = currentPlayer
      currentPlayer = currentPlayer === 1 ? -1 : 1
    }

    return this.getGameResult(state)
  }

  private backpropagate(node: MCTSNode | null, result: number): void {
    while (node !== null) {
      node.visits++
      node.wins += result
      node = node.parent
    }
  }

  private getBestChild(node: MCTSNode, explorationConstant: number): MCTSNode | null {
    let bestChild: MCTSNode | null = null
    let bestValue = Number.NEGATIVE_INFINITY

    for (const child of node.children.values()) {
      const exploitation = child.wins / child.visits
      const exploration = explorationConstant * Math.sqrt(Math.log(node.visits) / child.visits)
      const value = exploitation + exploration

      if (value > bestValue) {
        bestValue = value
        bestChild = child
      }
    }

    return bestChild
  }

  private isTerminal(state: number[]): boolean {
    return this.checkWinner(state) !== 0 || this.getAvailableActions(state).length === 0
  }

  private checkWinner(state: number[]): number {
    const winPatterns = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6],
    ]

    for (const pattern of winPatterns) {
      const [a, b, c] = pattern
      if (state[a] !== 0 && state[a] === state[b] && state[a] === state[c]) {
        return state[a]
      }
    }
    return 0
  }

  private getGameResult(state: number[]): number {
    const winner = this.checkWinner(state)
    if (winner === 1) return 1
    if (winner === -1) return -1
    return 0
  }
}
