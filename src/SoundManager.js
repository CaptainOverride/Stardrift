// Simple synth sound generator using Web Audio API
class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)()
        this.masterGain = this.ctx.createGain()
        this.masterGain.gain.value = 0.3 // Lower volume
        this.masterGain.connect(this.ctx.destination)
    }

    playCollectSound() {
        if (this.ctx.state === 'suspended') this.ctx.resume()

        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()

        osc.connect(gain)
        gain.connect(this.masterGain)

        // Nice retro "ping"
        osc.type = 'sine'
        osc.frequency.setValueAtTime(440, this.ctx.currentTime)
        osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.1)

        gain.gain.setValueAtTime(1, this.ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3)

        osc.start()
        osc.stop(this.ctx.currentTime + 0.3)
    }

    playEngineHum(speed) {
        // Placeholder for engine sound - might be annoying if not done right, 
        // so keeping it simple or skipping for now.
    }
}

export const audio = new SoundManager()
