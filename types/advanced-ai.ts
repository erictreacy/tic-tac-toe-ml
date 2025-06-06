export interface NeuralNetwork {
  weights: number[][][]
  biases: number[][]
  layers: number[]
}

export interface Experience {
  state: number[]
  action: number
  reward: number
  nextState: number[]
  done: boolean
}

export interface MCTSNode {
  state: number[]
  visits: number
  wins: number
  children: Map<number, MCTSNode>
  parent: MCTSNode | null
  action: number
  isFullyExpanded: boolean
}

export interface AIStrategy {
  name: string
  getMove: (board: number[]) => number
  confidence: number
  winRate: number
}
