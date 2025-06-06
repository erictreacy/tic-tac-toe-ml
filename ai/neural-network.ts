export class DeepQNetwork {
  private weights: number[][][]
  private biases: number[][]
  private learningRate = 0.001
  private layers = [27, 64, 32, 16, 9]

  constructor() {
    this.initializeNetwork()
  }

  private initializeNetwork(): void {
    this.weights = []
    this.biases = []

    for (let i = 0; i < this.layers.length - 1; i++) {
      const layerWeights: number[][] = []
      const layerBiases: number[] = []

      for (let j = 0; j < this.layers[i + 1]; j++) {
        const neuronWeights: number[] = []
        for (let k = 0; k < this.layers[i]; k++) {
          neuronWeights.push((Math.random() - 0.5) * 2 * Math.sqrt(6 / (this.layers[i] + this.layers[i + 1])))
        }
        layerWeights.push(neuronWeights)
        layerBiases.push(0)
      }

      this.weights.push(layerWeights)
      this.biases.push(layerBiases)
    }
  }

  private relu(x: number): number {
    return Math.max(0, x)
  }

  public forward(input: number[]): number[] {
    let activation = [...input]

    for (let i = 0; i < this.weights.length; i++) {
      const newActivation: number[] = []

      for (let j = 0; j < this.weights[i].length; j++) {
        let sum = this.biases[i][j]
        for (let k = 0; k < activation.length; k++) {
          sum += activation[k] * this.weights[i][j][k]
        }
        newActivation.push(i === this.weights.length - 1 ? sum : this.relu(sum))
      }

      activation = newActivation
    }

    return activation
  }

  public train(
    experiences: Array<{ state: number[]; action: number; reward: number; nextState: number[]; done: boolean }>,
  ): void {
    const batchSize = Math.min(32, experiences.length)
    const batch = experiences.slice(-batchSize)

    for (const experience of batch) {
      const currentQ = this.forward(experience.state)
      const nextQ = experience.done ? [] : this.forward(experience.nextState)

      const targetQ = [...currentQ]
      const target = experience.done ? experience.reward : experience.reward + 0.95 * Math.max(...nextQ)

      targetQ[experience.action] = target
      this.updateWeights(experience.state, targetQ)
    }
  }

  private updateWeights(input: number[], target: number[]): void {
    const output = this.forward(input)
    const outputError = target.map((t, i) => t - output[i])

    // Simplified weight update for output layer
    for (let i = 0; i < this.weights[this.weights.length - 1].length; i++) {
      for (let j = 0; j < this.weights[this.weights.length - 1][i].length; j++) {
        this.weights[this.weights.length - 1][i][j] += this.learningRate * outputError[i] * input[j]
      }
      this.biases[this.biases.length - 1][i] += this.learningRate * outputError[i]
    }
  }

  public getNetworkInfo(): { layers: number[]; totalWeights: number } {
    let totalWeights = 0
    for (const layer of this.weights) {
      for (const neuron of layer) {
        totalWeights += neuron.length
      }
    }
    return { layers: this.layers, totalWeights }
  }
}
