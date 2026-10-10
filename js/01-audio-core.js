// ============================================================================
// MODULE 01: AUDIO ENGINE, SYNTHWAVE SEQUENCER, INPUT, BIOMES & UPGRADE DATA
// ============================================================================
/* =========================================================================
   1. MULTI-TRACK PROCEDURAL DARKSYNTH / SYNTHWAVE AUDIO ENGINE + ANALYSER
   ========================================================================= */
const TRACKS = [
  {
    name: '01. NEON OVERDRIVE',
    bpm: 132,
    // D minor Darksynth (Dm -> Bb -> Gm -> A)
    bass: [
      36.71, 36.71, 73.42, 36.71, 36.71, 73.42, 65.41, 73.42,
      29.14, 29.14, 58.27, 29.14, 29.14, 58.27, 65.41, 58.27,
      49.00, 49.00, 98.00, 49.00, 49.00, 98.00, 87.31, 98.00,
      55.00, 55.00, 110.0, 55.00, 61.74, 55.00, 49.00, 41.20
    ],
    arp: [
      293.66, 349.23, 440.00, 587.33, 440.00, 349.23, 587.33, 523.25,
      233.08, 293.66, 349.23, 466.16, 349.23, 293.66, 523.25, 466.16,
      196.00, 233.08, 293.66, 392.00, 293.66, 233.08, 466.16, 392.00,
      220.00, 277.18, 329.63, 440.00, 554.37, 440.00, 329.63, 277.18
    ],
    lead: [
      587.33, 0, 523.25, 440.00, 0, 349.23, 440.00, 523.25,
      466.16, 0, 440.00, 349.23, 0, 293.66, 349.23, 440.00,
      392.00, 0, 466.16, 587.33, 0, 659.25, 587.33, 466.16,
      554.37, 0, 659.25, 880.00, 0, 659.25, 554.37, 440.00
    ],
    chords: [
      [146.83, 220.00, 293.66, 349.23],
      [116.54, 174.61, 233.08, 293.66],
      [196.00, 233.08, 293.66, 392.00],
      [110.00, 164.81, 220.00, 277.18]
    ]
  },
  {
    name: '02. CYBERNETIC PULSE',
    bpm: 140,
    // E minor Acid / Cyberpunk
    bass: [
      41.20, 82.41, 41.20, 82.41, 41.20, 98.00, 82.41, 73.42,
      32.70, 65.41, 32.70, 65.41, 32.70, 73.42, 65.41, 58.27,
      36.71, 73.42, 36.71, 73.42, 36.71, 87.31, 73.42, 65.41,
      46.25, 92.50, 46.25, 92.50, 49.00, 98.00, 61.74, 55.00
    ],
    arp: [
      329.63, 392.00, 493.88, 659.25, 783.99, 659.25, 493.88, 392.00,
      261.63, 329.63, 392.00, 523.25, 659.25, 523.25, 392.00, 329.63,
      293.66, 369.99, 440.00, 587.33, 739.99, 587.33, 440.00, 369.99,
      246.94, 311.13, 369.99, 493.88, 659.25, 587.33, 493.88, 369.99
    ],
    lead: [
      659.25, 659.25, 783.99, 0, 659.25, 587.33, 493.88, 0,
      523.25, 523.25, 659.25, 0, 587.33, 493.88, 392.00, 0,
      587.33, 587.33, 739.99, 0, 659.25, 587.33, 440.00, 0,
      493.88, 587.33, 659.25, 783.99, 987.77, 783.99, 659.25, 493.88
    ],
    chords: [
      [164.81, 246.94, 329.63, 392.00],
      [130.81, 196.00, 261.63, 329.63],
      [146.83, 220.00, 293.66, 369.99],
      [123.47, 185.00, 246.94, 369.99]
    ]
  },
  {
    name: '03. QUANTUM HORIZON',
    bpm: 125,
    // A minor Outrun Anthem
    bass: [
      55.00, 55.00, 110.0, 55.00, 55.00, 110.0, 98.00, 110.0,
      43.65, 43.65, 87.31, 43.65, 43.65, 87.31, 77.78, 87.31,
      32.70, 32.70, 65.41, 32.70, 32.70, 65.41, 73.42, 65.41,
      36.71, 36.71, 73.42, 36.71, 41.20, 41.20, 82.41, 55.00
    ],
    arp: [
      440.00, 523.25, 659.25, 880.00, 659.25, 523.25, 659.25, 523.25,
      349.23, 440.00, 523.25, 698.46, 523.25, 440.00, 523.25, 440.00,
      261.63, 329.63, 392.00, 523.25, 392.00, 329.63, 392.00, 329.63,
      293.66, 392.00, 493.88, 587.33, 659.25, 587.33, 493.88, 392.00
    ],
    lead: [
      880.00, 0, 783.99, 659.25, 523.25, 659.25, 0, 440.00,
      698.46, 0, 659.25, 523.25, 440.00, 523.25, 0, 349.23,
      523.25, 0, 659.25, 783.99, 880.00, 783.99, 659.25, 523.25,
      587.33, 659.25, 783.99, 880.00, 1046.5, 987.77, 880.00, 783.99
    ],
    chords: [
      [220.00, 261.63, 329.63, 440.00],
      [174.61, 220.00, 261.63, 349.23],
      [130.81, 196.00, 261.63, 329.63],
      [146.83, 196.00, 246.94, 392.00]
    ]
  }
];

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicBus = null;
    this.sfxBus = null;
    this.analyser = null;
    this.delayNode = null;
    this.noiseBuffer = null;
    this.enabled = true;
    this.isPlaying = false;
    this.masterVolume = 0.85;
    this.trackIndex = 0;
    this.step = 0;
    this.musicTimer = null;
    this.beatPulse = 0; // 0..1 visual pulse on kick
    this.freqData = new Uint8Array(16);
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();

      // Master Compressor for punchy synthwave mix
      const comp = this.ctx.createDynamicsCompressor();
      comp.threshold.setValueAtTime(-16, this.ctx.currentTime);
      comp.knee.setValueAtTime(12, this.ctx.currentTime);
      comp.ratio.setValueAtTime(6, this.ctx.currentTime);
      comp.attack.setValueAtTime(0.003, this.ctx.currentTime);
      comp.release.setValueAtTime(0.18, this.ctx.currentTime);

      this.master = this.ctx.createGain();
      this.master.gain.value = this.masterVolume;

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.72;
      this.freqData = new Uint8Array(this.analyser.frequencyBinCount);

      this.musicBus = this.ctx.createGain();
      this.musicBus.gain.value = 0.72;

      this.sfxBus = this.ctx.createGain();
      this.sfxBus.gain.value = 0.9;

      // Stereo Ping-Pong / Echo Delay for Lead & Arps
      this.delayNode = this.ctx.createDelay(1.0);
      this.delayNode.delayTime.value = 0.22;
      const delayFeedback = this.ctx.createGain();
      delayFeedback.gain.value = 0.32;
      const delayFilter = this.ctx.createBiquadFilter();
      delayFilter.type = 'lowpass';
      delayFilter.frequency.value = 2400;

      this.delayNode.connect(delayFilter);
      delayFilter.connect(delayFeedback);
      delayFeedback.connect(this.delayNode);
      this.delayNode.connect(this.musicBus);

      this.musicBus.connect(comp);
      this.sfxBus.connect(comp);
      comp.connect(this.master);
      this.master.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      // Pre-generate white noise buffer for drums & explosions
      const bufLen = this.ctx.sampleRate * 1.0;
      this.noiseBuffer = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufLen; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.enabled && !this.isPlaying) {
      this.isPlaying = true;
      this.scheduleTick();
    }
  }

  setVolume(val) {
    this.masterVolume = Math.max(0.0001, Math.min(1.0, val));
    if (this.ctx && this.master && this.enabled) {
      this.master.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.03);
    }
  }

  toggle() {
    this.init();
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.master.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
      if (!this.isPlaying) {
        this.isPlaying = true;
        this.scheduleTick();
      }
    } else {
      this.master.gain.setTargetAtTime(0.0001, this.ctx.currentTime, 0.05);
      this.isPlaying = false;
      clearTimeout(this.musicTimer);
    }
    return this.enabled;
  }

  nextTrack() {
    this.init();
    this.trackIndex = (this.trackIndex + 1) % TRACKS.length;
    this.step = 0;
    return TRACKS[this.trackIndex];
  }

  scheduleTick() {
    if (!this.enabled || !this.isPlaying || !this.ctx) return;

    const track = TRACKS[this.trackIndex];
    // Slight tempo boost during Overdrive!
    const tempoMult = (typeof player !== 'undefined' && player.overdriveActive > 0) ? 1.08 : 1.0;
    const stepDur = (60 / (track.bpm * tempoMult)) / 4; // 16th note in seconds
    const t = this.ctx.currentTime + 0.01;
    const step32 = this.step % 32;
    const step16 = this.step % 16;

    // 1. KICK DRUM (Four-on-the-floor + syncopated ghost kick)
    if (step16 % 4 === 0 || step16 === 14) {
      const isGhost = step16 === 14;
      this.playKick(t, isGhost ? 0.22 : 0.48);
      if (!isGhost) this.beatPulse = 1.0;
    }

    // 2. GATED SYNTHWAVE SNARE (Beats 2 and 4 -> step 4 & 12)
    if (step16 === 4 || step16 === 12) {
      this.playSnare(t, 0.30);
    } else if (step32 === 31 || step32 === 30) {
      // Drum fill at end of 2 bars
      this.playSnare(t, 0.16);
    }

    // 3. CRISP HI-HATS (Every 16th note, accented off-beats)
    const openHat = (step16 % 4 === 2);
    this.playHat(t, openHat ? 0.09 : 0.035, openHat ? 0.11 : 0.035);

    // 4. ROLLING DUAL-SAW SYNTH BASS
    const bassFreq = track.bass[step32];
    if (bassFreq) {
      this.playBass(t, bassFreq, stepDur * 0.92, step16 % 4 === 0);
    }

    // 5. LUSH POLY CHORD PAD (Every 8 steps = half bar)
    if (step32 % 8 === 0) {
      const chordIdx = Math.floor(step32 / 8) % track.chords.length;
      this.playChordPad(t, track.chords[chordIdx], stepDur * 7.8);
    }

    // 6. CYBERPUNK ARPEGGIATOR
    const arpFreq = track.arp[step32];
    if (arpFreq) {
      const intense = (typeof combo !== 'undefined' && combo >= 2) ||
                      (typeof player !== 'undefined' && player.overdriveActive > 0) ||
                      (this.step % 64 >= 16);
      this.playArp(t, arpFreq * (intense ? 1 : 0.5), stepDur * 0.75);
    }

    // 7. SOARING SYNTH LEAD (Plays on alternate 32-step phrases or during combat action)
    const leadFreq = track.lead[step32];
    const playLeadPhrase = (Math.floor(this.step / 32) % 2 === 1) ||
                           (typeof player !== 'undefined' && player.overdriveActive > 0) ||
                           (typeof enemies !== 'undefined' && enemies.some(e => e.isBoss || e.type === 'boss'));
    if (leadFreq && playLeadPhrase) {
      this.playLead(t, leadFreq, stepDur * 1.8);
    }

    this.step++;
    this.musicTimer = setTimeout(() => this.scheduleTick(), stepDur * 1000);
  }

  playKick(t, vol) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(38, t + 0.09);
    osc.frequency.exponentialRampToValueAtTime(28, t + 0.22);

    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);

    osc.connect(gain);
    gain.connect(this.musicBus);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  playSnare(t, vol) {
    // Tone body
    const osc = this.ctx.createOscillator();
    const oGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(210, t);
    osc.frequency.exponentialRampToValueAtTime(95, t + 0.11);
    oGain.gain.setValueAtTime(vol * 0.7, t);
    oGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);
    osc.connect(oGain);
    oGain.connect(this.musicBus);
    osc.start(t);
    osc.stop(t + 0.13);

    // Gated noise burst
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, t);
    filter.Q.value = 0.7;
    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(vol, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + 0.19);
    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.musicBus);
    noise.start(t);
    noise.stop(t + 0.2);
  }

  playHat(t, vol, dur) {
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(7500, t);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicBus);
    noise.start(t);
    noise.stop(t + dur + 0.01);
  }

  playBass(t, freq, dur, isDownbeat) {
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';
    osc1.frequency.setValueAtTime(freq, t);
    osc2.frequency.setValueAtTime(freq * 1.006, t); // Fat detune

    filter.type = 'lowpass';
    filter.Q.value = 4.5;
    const peakCutoff = isDownbeat ? 900 : 1450; // Sidechain-like pump
    filter.frequency.setValueAtTime(peakCutoff, t);
    filter.frequency.exponentialRampToValueAtTime(140, t + dur);

    const v = isDownbeat ? 0.13 : 0.19;
    gain.gain.setValueAtTime(v, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicBus);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + dur + 0.01);
    osc2.stop(t + dur + 0.01);
  }

  playChordPad(t, freqs, dur) {
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, t);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, t);
    gain.gain.linearRampToValueAtTime(0.04, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    filter.connect(gain);
    gain.connect(this.musicBus);

    freqs.forEach((f, idx) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f * (1 + (idx - 1.5) * 0.003), t);
      osc.connect(filter);
      osc.start(t);
      osc.stop(t + dur + 0.02);
    });
  }

  playArp(t, freq, dur) {
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(freq * 2.5, t);
    filter.Q.value = 1.5;

    gain.gain.setValueAtTime(0.065, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicBus);
    gain.connect(this.delayNode);
    osc.start(t);
    osc.stop(t + dur + 0.01);
  }

  playLead(t, freq, dur) {
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(freq, t);
    osc2.frequency.setValueAtTime(freq * 1.008, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3600, t);
    filter.frequency.exponentialRampToValueAtTime(900, t + dur);
    filter.Q.value = 2.5;

    gain.gain.setValueAtTime(0.055, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicBus);
    gain.connect(this.delayNode);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + dur + 0.02);
    osc2.stop(t + dur + 0.02);
  }

  // ---- SOUND EFFECTS ----
  uiHover() {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2400, t);
      osc.frequency.exponentialRampToValueAtTime(3200, t + 0.032);
      gain.gain.setValueAtTime(0.03, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
      osc.connect(gain);
      gain.connect(this.sfxBus);
      osc.start(t);
      osc.stop(t + 0.04);
    } catch (e) {}
  }

  uiSelect() {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      [880, 1760].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.035);
        gain.gain.setValueAtTime(0.065, t + idx * 0.035);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.035 + 0.075);
        osc.connect(gain);
        gain.connect(this.sfxBus);
        osc.start(t + idx * 0.035);
        osc.stop(t + idx * 0.035 + 0.08);
      });
    } catch (e) {}
  }

  warpLaunch() {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // Rising spool-up turbine sweep
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(90, t);
      osc.frequency.exponentialRampToValueAtTime(2600, t + 0.42);
      gain.gain.setValueAtTime(0.04, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.38);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.connect(gain);
      gain.connect(this.sfxBus);
      osc.start(t);
      osc.stop(t + 0.52);

      // Sub impact punch at launch
      const sub = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(140, t + 0.32);
      sub.frequency.exponentialRampToValueAtTime(28, t + 0.78);
      subGain.gain.setValueAtTime(0.35, t + 0.32);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.82);
      sub.connect(subGain);
      subGain.connect(this.sfxBus);
      sub.start(t + 0.32);
      sub.stop(t + 0.84);
    } catch (e) {}
  }

  laser(isRail = false) {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = isRail ? 'square' : 'sawtooth';
    osc.frequency.setValueAtTime(isRail ? 1400 : 920 + Math.random() * 140, t);
    osc.frequency.exponentialRampToValueAtTime(isRail ? 180 : 130, t + (isRail ? 0.16 : 0.09));
    gain.gain.setValueAtTime(isRail ? 0.11 : 0.06, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (isRail ? 0.16 : 0.09));
    osc.connect(gain);
    gain.connect(this.sfxBus);
    osc.start(t);
    osc.stop(t + (isRail ? 0.17 : 0.1));
  }

  shoot() {
    this.laser(false);
  }

  pickup(comboPitch = 1) {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const base = Math.min(1320, 520 + comboPitch * 45);
    osc.frequency.setValueAtTime(base, t);
    osc.frequency.exponentialRampToValueAtTime(base * 1.5, t + 0.08);
    gain.gain.setValueAtTime(0.07, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);
    osc.connect(gain);
    gain.connect(this.sfxBus);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  explosion(isBig = false) {
    if (!this.enabled || !this.ctx || !this.noiseBuffer) return;
    const t = this.ctx.currentTime;
    const dur = isBig ? 0.55 : 0.26;

    // Sub impact punch
    const sub = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    sub.type = 'sine';
    sub.frequency.setValueAtTime(isBig ? 120 : 95, t);
    sub.frequency.exponentialRampToValueAtTime(22, t + dur);
    subGain.gain.setValueAtTime(isBig ? 0.35 : 0.18, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    sub.connect(subGain);
    subGain.connect(this.sfxBus);
    sub.start(t);
    sub.stop(t + dur);

    // Filtered noise blast
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isBig ? 1200 : 700, t);
    filter.frequency.exponentialRampToValueAtTime(55, t + dur);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(isBig ? 0.3 : 0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxBus);
    noise.start(t);
    noise.stop(t + dur);
  }

  explode(isBig = false) {
    this.explosion(isBig);
  }

  katanaSlash() {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(1650, t);
    osc.frequency.exponentialRampToValueAtTime(240, t + 0.14);
    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    osc.connect(gain);
    gain.connect(this.sfxBus);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  parryDeflect() {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    [880, 1318.5, 1760].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.025);
      gain.gain.setValueAtTime(0.13, t + i * 0.025);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.025 + 0.18);
      osc.connect(gain);
      gain.connect(this.sfxBus);
      osc.start(t + i * 0.025);
      osc.stop(t + i * 0.025 + 0.19);
    });
  }

  ringPass(stepIdx = 1) {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    const base = 587.33 * Math.pow(1.12, stepIdx);
    osc.frequency.setValueAtTime(base, t);
    osc.frequency.exponentialRampToValueAtTime(base * 1.35, t + 0.14);
    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);
    osc.connect(gain);
    gain.connect(this.sfxBus);
    osc.start(t);
    osc.stop(t + 0.17);
  }

  ionBeam() {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    [220, 440, 880].forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = i === 0 ? 'sawtooth' : 'square';
      osc.frequency.setValueAtTime(freq * 1.6, t);
      osc.frequency.exponentialRampToValueAtTime(freq, t + 0.35);
      gain.gain.setValueAtTime(0.09, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.connect(gain);
      gain.connect(this.sfxBus);
      osc.start(t);
      osc.stop(t + 0.46);
    });
  }

  chronoField(detonate = false) {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    if (!detonate) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(980, t);
      osc.frequency.exponentialRampToValueAtTime(140, t + 0.32);
      gain.gain.setValueAtTime(0.16, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.34);
      osc.connect(gain);
      gain.connect(this.sfxBus);
      osc.start(t);
      osc.stop(t + 0.35);
    } else {
      [523.25, 783.99, 1046.5, 1567.98].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.03);
        gain.gain.setValueAtTime(0.14, t + idx * 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.03 + 0.25);
        osc.connect(gain);
        gain.connect(this.sfxBus);
        osc.start(t + idx * 0.03);
        osc.stop(t + idx * 0.03 + 0.26);
      });
    }
  }

  phantomSalvo() {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    for (let i = 0; i < 5; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(420 + i * 160, t + i * 0.035);
      osc.frequency.exponentialRampToValueAtTime(1280 + i * 120, t + i * 0.035 + 0.11);
      gain.gain.setValueAtTime(0.08, t + i * 0.035);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.035 + 0.12);
      osc.connect(gain);
      gain.connect(this.sfxBus);
      osc.start(t + i * 0.035);
      osc.stop(t + i * 0.035 + 0.13);
    }
  }

  dash() {
    if (!this.enabled || !this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(960, t + 0.16);
    gain.gain.setValueAtTime(0.14, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.17);
    osc.connect(gain);
    gain.connect(this.sfxBus);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  overdrive() {
    if (!this.enabled || !this.ctx) return;
    const notes = [293.66, 440, 587.33, 880, 1174.66];
    const t = this.ctx.currentTime;
    notes.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, t + i * 0.045);
      gain.gain.setValueAtTime(0.12, t + i * 0.045);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.045 + 0.45);
      osc.connect(gain);
      gain.connect(this.sfxBus);
      osc.start(t + i * 0.045);
      osc.stop(t + i * 0.045 + 0.46);
    });
  }

  levelUp() {
    if (!this.enabled || !this.ctx) return;
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    const t = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);
      gain.gain.setValueAtTime(0.11, t + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.28);
      osc.connect(gain);
      gain.connect(this.sfxBus);
      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.3);
    });
  }

  bossSpawn() {
    if (!this.enabled || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      // Deep dreadnought war-horn + warning siren
      [110, 82.41, 55].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq * 1.25, t + idx * 0.08);
        osc.frequency.exponentialRampToValueAtTime(freq, t + idx * 0.08 + 0.55);
        gain.gain.setValueAtTime(0.16, t + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.6);
        osc.connect(gain);
        gain.connect(this.sfxBus);
        osc.start(t + idx * 0.08);
        osc.stop(t + idx * 0.08 + 0.62);
      });
    } catch (e) {}
  }
}

const sound = new SoundEngine();

/* =========================================================================
   2. GAME ENGINE, REACTIVE CYBER-GRID & ENTITIES
   ========================================================================= */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

// Open-World Sector Dimensions & Smooth Follow-Camera (Massive 8400x8400 Cyber-Metropolis!)
const WORLD_W = 8400;
const WORLD_H = 8400;
let camX = WORLD_W / 2 - canvas.width / 2;
let camY = WORLD_H / 2 - canvas.height / 2;

// Escalated Threat Protocol Tiers with Custom Vector SVG Icons (Zero Emojis)
const THREAT_MODES = [
  {
    id: 0,
    label: 'HARDENED 1.4x',
    name: 'HARDENED FLEET',
    svg: `<svg class="ui-svg-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 1.5L13.5 4.5V10.5L8 14.5L2.5 10.5V4.5L8 1.5Z"/><circle cx="6" cy="7.5" r="1.2" fill="currentColor"/><circle cx="10" cy="7.5" r="1.2" fill="currentColor"/><path d="M5.5 11H10.5"/></svg>`,
    hpMult: 1.4,
    speedMult: 1.15,
    fireMult: 1.28,
    dmgMult: 1.25,
    eliteBonus: 0.20,
    color: '#ff2a55'
  },
  {
    id: 1,
    label: 'OVERKILL 2.0x',
    name: 'OVERKILL SWARM',
    svg: `<svg class="ui-svg-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M8 1.5C11.5 5 13 7.5 13 10.2C13 12.9 10.8 14.8 8 14.8C5.2 14.8 3 12.9 3 10.2C3 8 4.5 6 6.2 4.2C6 6.2 7.2 7 8 5C8.3 3.8 8.2 2.6 8 1.5Z"/><circle cx="8" cy="11" r="1.8" fill="currentColor"/></svg>`,
    hpMult: 2.0,
    speedMult: 1.28,
    fireMult: 1.50,
    dmgMult: 1.45,
    eliteBonus: 0.34,
    color: '#ff7b00'
  },
  {
    id: 2,
    label: 'GODSLAYER 2.8x',
    name: 'APEX GODSLAYER',
    svg: `<svg class="ui-svg-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6"><polygon points="1.5,12.5 3,5 6.3,8.5 8,3 9.7,8.5 13,5 14.5,12.5" fill="rgba(255,230,0,0.22)"/><line x1="2" y1="14.2" x2="14" y2="14.2"/></svg>`,
    hpMult: 2.8,
    speedMult: 1.42,
    fireMult: 1.75,
    dmgMult: 1.65,
    eliteBonus: 0.50,
    color: '#ffe600'
  }
];
let threatModeIdx = 0;

function getThreatConfig() {
  return THREAT_MODES[threatModeIdx] || THREAT_MODES[0];
}

function setThreatMode(idx, notify = true) {
  threatModeIdx = ((idx % THREAT_MODES.length) + THREAT_MODES.length) % THREAT_MODES.length;
  const cfg = getThreatConfig();
  const badge = document.getElementById('threatBadge');
  if (badge) {
    badge.innerHTML = `${cfg.svg}<span id="threatBadgeText">${cfg.label}</span>`;
    badge.style.color = cfg.color;
    badge.style.borderColor = cfg.color;
  }
  document.querySelectorAll('.threat-mode-btn').forEach(btn => {
    btn.classList.toggle('selected', Number(btn.dataset.threat) === threatModeIdx);
  });
  const tEl = document.getElementById('telemetryThreat');
  if (tEl) tEl.textContent = `${cfg.name.split(' ')[0]} (${cfg.hpMult}X)`;
  if (notify) {
    sound.uiSelect();
    announce(`// THREAT PROTOCOL: ${cfg.name} (${cfg.hpMult}x ENEMY POWER) //`, cfg.color);
  }
}

const BIOME_ZONES = [
  { id: 'nexus', name: 'NEXUS CORE // CITADEL HUB', shortName: 'NEXUS CORE', x: 4200, y: 4200, r: 1500, color: '#00f0ff', rgb: '0, 240, 255' },
  { id: 'skyline', name: 'CYBER-MEGAPOLIS // SKYLINE SECTOR', shortName: 'SKYLINE SECTOR', x: 4200, y: 1550, r: 1350, color: '#38bdf8', rgb: '56, 189, 248' },
  { id: 'foundry', name: 'CRIMSON FOUNDRY // WEAPON FORGE', shortName: 'CRIMSON FOUNDRY', x: 1800, y: 1800, r: 1400, color: '#ff0055', rgb: '255, 0, 85' },
  { id: 'vault', name: 'QUANTUM VAULT // DATA ARCHIVE', shortName: 'QUANTUM VAULT', x: 6600, y: 1800, r: 1400, color: '#ffe600', rgb: '255, 230, 0' },
  { id: 'nebula', name: 'ION NEBULA // NANITE SANCTUARY', shortName: 'ION NEBULA', x: 1800, y: 6600, r: 1400, color: '#00ff88', rgb: '0, 255, 136' },
  { id: 'void', name: 'VOID SINGULARITY // DARK SECTOR', shortName: 'VOID SINGULARITY', x: 6600, y: 6600, r: 1450, color: '#d946ef', rgb: '217, 70, 239' },
  { id: 'abyss', name: 'ABYSSAL MECHA // TITAN CRATER', shortName: 'TITAN CRATER', x: 4200, y: 6850, r: 1350, color: '#f97316', rgb: '249, 115, 22' }
];

function getActiveBiome(wx, wy) {
  for (let i = 0; i < BIOME_ZONES.length; i++) {
    const b = BIOME_ZONES[i];
    const dx = wx - b.x;
    const dy = wy - b.y;
    if (dx * dx + dy * dy <= b.r * b.r) return b;
  }
  return { id: 'expanse', name: 'HYPER-GRID EXPANSE // UNCHARTED', shortName: 'HYPER-GRID', x: wx, y: wy, r: 0, color: '#00f0ff', rgb: '0, 240, 255' };
}

// Input state (screenX/screenY for reticle, x/y for world space)
const keys = {};
const mouse = {
  screenX: canvas.width / 2,
  screenY: canvas.height / 2,
  x: WORLD_W / 2,
  y: WORLD_H / 2,
  down: false
};
let autoFire = localStorage.getItem('neon_autofire') !== 'false';
let upgradeOpenedTimestamp = 0;
let pendingLevelUps = 0;

window.addEventListener('keydown', e => {
  keys[e.code] = true;
  if (gameState === 'PLAYING') {
    if (e.code === 'Space' || e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
      e.preventDefault();
      player.tryDash();
    }
    if (e.code === 'KeyQ' || e.code === 'Digit1' || e.code === 'Numpad1') {
      player.tryKatana();
    }
    if (e.code === 'KeyR' || e.code === 'Digit2' || e.code === 'Numpad2') {
      player.tryIonBeam();
    }
    if (e.code === 'KeyF' || e.code === 'Digit3' || e.code === 'Numpad3') {
      player.tryChronoField();
    }
    if (e.code === 'KeyX' || e.code === 'Digit4' || e.code === 'Numpad4') {
      player.tryPhantomBarrage();
    }
    if (e.code === 'KeyE' || e.code === 'Digit5' || e.code === 'Numpad5') {
      player.tryOverdrive();
    }
    if (e.code === 'KeyV' || e.code === 'Digit6' || e.code === 'Numpad6') {
      player.tryChaosOverload();
    }
    if (e.code === 'KeyG') {
      toggleAutoFire();
    }
    if (e.code === 'KeyC') {
      triggerLiveContract(true);
    }
    if (e.code === 'KeyT') {
      setThreatMode(threatModeIdx + 1, true);
    }
  } else if (gameState === 'UPGRADE') {
    // Prevent accidental combat key press or rapid-fire misclick from registering
    if (performance.now() - upgradeOpenedTimestamp < 260) return;
    if ((e.code === 'Digit1' || e.code === 'Numpad1') && currentUpgradeChoices[0]) {
      applyUpgrade(currentUpgradeChoices[0]);
    } else if ((e.code === 'Digit2' || e.code === 'Numpad2') && currentUpgradeChoices[1]) {
      applyUpgrade(currentUpgradeChoices[1]);
    } else if ((e.code === 'Digit3' || e.code === 'Numpad3') && currentUpgradeChoices[2]) {
      applyUpgrade(currentUpgradeChoices[2]);
    } else if (e.code === 'KeyR') {
      rerollUpgrades();
    } else if (e.code === 'KeyH') {
      healSkipUpgrade();
    }
  } else if (gameState === 'GAMEOVER') {
    if ((e.code === 'Space' || e.code === 'Enter') && performance.now() - gameOverTimestamp > 450) {
      e.preventDefault();
      sound.init();
      startNewGame();
    } else if (e.code === 'KeyT') {
      setThreatMode(threatModeIdx + 1, true);
    }
  }
});

window.addEventListener('keyup', e => { keys[e.code] = false; });
window.addEventListener('mousemove', e => {
  mouse.screenX = e.clientX;
  mouse.screenY = e.clientY;
  mouse.x = mouse.screenX + camX;
  mouse.y = mouse.screenY + camY;
});
window.addEventListener('mousedown', e => {
  if (e.button === 2) {
    e.preventDefault();
    if (gameState === 'PLAYING') player.tryDash();
  } else if (e.button === 1) {
    e.preventDefault();
    if (gameState === 'PLAYING') player.tryKatana();
  } else if (e.button === 0) {
    mouse.down = true;
  }
});
window.addEventListener('mouseup', e => {
  if (e.button === 0) mouse.down = false;
});
window.addEventListener('contextmenu', e => e.preventDefault());

function toggleAutoFire() {
  autoFire = !autoFire;
  try { localStorage.setItem('neon_autofire', autoFire ? 'true' : 'false'); } catch (e) {}
  const btn = document.getElementById('autoFireBtn');
  const txt = document.getElementById('autoFireBtnText');
  if (txt) txt.textContent = autoFire ? 'AUTO' : 'MAN';
  if (btn) btn.classList.toggle('active-mode', autoFire);
  announce(`// WEAPONS MATRIX: ${autoFire ? 'AUTO-CYCLING ACTIVE' : 'MANUAL TRIGGER ENGAGED'} //`, autoFire ? '#00ff88' : '#ffe600');
}

// Screen Shake, Hitstop & Chromatic Flash
let screenShake = 0;
let hitStopFrames = 0;
let chromaticFlash = 0;
let gridRipples = [];

function addGridRipple(x, y, radius, force, color = '#00f0ff') {
  if (gridRipples.length >= 5) gridRipples.shift();
  gridRipples.push({ x, y, r: 10, maxR: radius, force, color, life: 1.0 });
}

// Pre-rendered Radial Glow Sprite Cache (Eliminates expensive ctx.shadowBlur Gaussian passes)
const glowSpriteCache = {};
function getGlowSprite(color) {
  if (glowSpriteCache[color]) return glowSpriteCache[color];
  const sz = 64;
  const off = document.createElement('canvas');
  off.width = sz;
  off.height = sz;
  const octx = off.getContext('2d');
  const grad = octx.createRadialGradient(sz / 2, sz / 2, 2, sz / 2, sz / 2, sz / 2);
  grad.addColorStop(0, color);
  grad.addColorStop(0.35, color + '66');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  octx.fillStyle = grad;
  octx.fillRect(0, 0, sz, sz);
  glowSpriteCache[color] = off;
  return off;
}

// Banner Announcer
let bannerTimeout = null;
function announce(text, color = '#00f0ff') {
  const el = document.getElementById('announcementBanner');
  el.textContent = text;
  el.style.color = color;
  el.classList.add('show');
  clearTimeout(bannerTimeout);
  bannerTimeout = setTimeout(() => el.classList.remove('show'), 2200);
}

// Stackable Cyber Upgrades with Custom Glowing Vector SVG Emblems (Zero Emojis)
const ALL_UPGRADES = [
  {
    id: 'multishot',
    title: 'Twin Plasma Matrix',
    category: '// WEAPON ARRAY',
    color: '#00f0ff',
    stat: '▸ SALVO: +1 PLASMA STREAM | SPREAD COVERAGE +15%',
    desc: 'Splits your primary plasma conduit to fire an additional synchronized energy stream.',
    svg: `<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" style="color:#00f0ff"><path d="M20 4L20 36"/><path d="M10 9L16 34"/><path d="M30 9L24 34"/><polygon points="20,2 16,10 24,10" fill="#00f0ff"/><polygon points="9,6 7,13 13,12" fill="#00f0ff"/><polygon points="31,6 27,12 33,13" fill="#00f0ff"/><circle cx="20" cy="28" r="4" fill="#ffe600" stroke="#ffffff"/></svg>`
  },
  {
    id: 'firerate',
    title: 'Hyper-Trigger Overclock',
    category: '// CYCLIC ACCELERATOR',
    color: '#ff0077',
    stat: '▸ FIRE RATE: +25% CYCLING | BOLT VELOCITY +18%',
    desc: 'Supercharges weapon capacitors to cycle plasma salvos at blistering hyper-frequency.',
    svg: `<svg viewBox="0 0 40 40" fill="none" stroke="#ff0077" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polygon points="23,3 9,22 20,22 17,37 31,18 20,18" fill="rgba(255,0,119,0.28)"/><circle cx="20" cy="20" r="16" stroke-dasharray="5 4" stroke="#ffe600" stroke-width="1.6"/></svg>`
  },
  {
    id: 'katana',
    title: 'Dimension Katana Core',
    category: '// RIFT MELEE SKILL [Q]',
    color: '#00ff88',
    stat: '▸ KATANA [Q]: +1 CRESCENT WAVE | X-CROSS RIFT CLEAVE',
    desc: 'Expands your [Q] Rift Katana to hurl multi-wave dimension cuts and reflect bullets at 3.5x damage.',
    svg: `<svg viewBox="0 0 40 40" fill="none" stroke="#00ff88" stroke-width="2.4" stroke-linecap="round"><path d="M6 34L34 6" stroke="#ffe600" stroke-width="3"/><path d="M10 6L34 30" stroke="#ff0077" stroke-width="2.2" stroke-dasharray="4 3"/><path d="M12 5C25 5 35 15 35 28" stroke="#00f0ff" stroke-width="2.5"/><polygon points="35,5 27,7 33,13" fill="#ffe600"/></svg>`
  },
  {
    id: 'ion_beam',
    title: 'Omega Funnel Array',
    category: '// HYPER-LASER SKILL [R]',
    color: '#00f0ff',
    stat: '▸ LASER [R]: +1 ORBITAL FUNNEL BIT | +35% BEAM & RAIL FINALE',
    desc: 'Adds autonomous Fin-Funnel Laser Bits to your [R] Omega Ion Cannon and triggers a Rail Finale.',
    svg: `<svg viewBox="0 0 40 40" fill="none" stroke="#00f0ff" stroke-width="2.4"><polygon points="3,12 11,8 11,32 3,28" fill="rgba(0,240,255,0.28)"/><circle cx="11" cy="20" r="4.5" fill="#ffe600" stroke="#ffffff"/><line x1="15" y1="20" x2="38" y2="20" stroke="#ffffff" stroke-width="4"/><line x1="14" y1="11" x2="37" y2="16" stroke="#00f0ff" stroke-width="2"/><line x1="14" y1="29" x2="37" y2="24" stroke="#ff0077" stroke-width="2"/></svg>`
  },
  {
    id: 'chrono_phantom',
    title: 'Chrono-Phantom Matrix',
    category: '// TACTICAL SKILLS [F] & [X]',
    color: '#d946ef',
    stat: '▸ [F] DOME +35% ORBITAL TRAP | [X] +4 MISSILES & TETHER',
    desc: 'Amplifies your [F] Chrono Singularity Dome and upgrades your [X] Phantom Clone laser tether & salvo.',
    svg: `<svg viewBox="0 0 40 40" fill="none" stroke="#d946ef" stroke-width="2.3"><circle cx="20" cy="20" r="15" stroke-dasharray="5 3"/><polygon points="20,7 31,20 20,33 9,20" stroke="#00f0ff" stroke-width="1.8" fill="rgba(217,70,239,0.2)"/><polyline points="20,11 20,20 27,24" stroke="#ffe600" stroke-width="2.6"/><circle cx="20" cy="20" r="3" fill="#ffffff"/></svg>`
  },
  {
    id: 'railgun',
    title: 'Quantum Rail Lance',
    category: '// HEAVY ORDNANCE',
    color: '#ff0077',
    stat: '▸ RAIL DMG: 48 PIERCING | HYPER-VELOCITY BEAM',
    desc: 'Every Nth salvo discharges a relativistic magenta railbeam that pierces through all hostiles.',
    svg: `<svg viewBox="0 0 40 40" fill="none" stroke="#ff0077" stroke-width="2.2"><line x1="4" y1="36" x2="36" y2="4" stroke="#ffe600" stroke-width="3.5"/><path d="M10 22L22 10M18 30L30 18" stroke="#00f0ff"/><circle cx="28" cy="12" r="6" stroke="#ff0077" fill="rgba(255,0,119,0.3)"/><circle cx="16" cy="24" r="4" stroke="#00f0ff"/></svg>`
  },
  {
    id: 'lightning',
    title: 'Arc-Tesla Coil',
    category: '// VOLTAIC CONDUIT',
    color: '#00f0ff',
    stat: '▸ CHAIN ARCS: +1 JUMP | 55% VOLTAIC SPLASH DMG',
    desc: 'Projectiles discharge high-voltage chain lightning that leaps across nearby enemy packs.',
    svg: `<svg viewBox="0 0 40 40" fill="none" stroke="#00f0ff" stroke-width="2.2"><polyline points="8,32 16,18 12,18 24,6 22,18 30,18 18,34" fill="rgba(0,240,255,0.25)"/><circle cx="8" cy="32" r="3" fill="#ffe600"/><circle cx="32" cy="10" r="3" fill="#ff0077"/><path d="M24 6L32 10" stroke="#ffe600" stroke-dasharray="2 2"/></svg>`
  },
  {
    id: 'drones',
    title: 'Orbital Combat Drone',
    category: '// AUTONOMOUS WINGMAN',
    color: '#00ff88',
    stat: '▸ +1 ORBITAL DRONE | AUTO-TARGETING PULSE',
    desc: 'Deploys an autonomous cyber-interceptor that orbits your hull and snipes nearby threats.',
    svg: `<svg viewBox="0 0 40 40" fill="none" stroke="#00ff88" stroke-width="2.2"><circle cx="20" cy="20" r="14" stroke-dasharray="6 4" stroke="rgba(0,255,136,0.5)"/><polygon points="20,9 29,26 20,22 11,26" fill="rgba(0,255,136,0.28)"/><circle cx="20" cy="18" r="2.5" fill="#ffffff"/><circle cx="34" cy="20" r="3" fill="#00f0ff"/></svg>`
  },
  {
    id: 'homing',
    title: 'Swarm Seeker Pods',
    category: '// SMART MUNITIONS',
    color: '#ffe600',
    stat: '▸ +1 SEEKER MISSILE / SALVO | 55 CRIT BLAST DMG',
    desc: 'Periodically launches curving micro-missiles that autonomously lock onto priority targets.',
    svg: `<svg viewBox="0 0 40 40" fill="none" stroke="#ffe600" stroke-width="2.2"><circle cx="20" cy="20" r="13" stroke="#ff0077" stroke-dasharray="4 3"/><line x1="20" y1="3" x2="20" y2="11"/><line x1="20" y1="29" x2="20" y2="37"/><line x1="3" y1="20" x2="11" y2="20"/><line x1="29" y1="20" x2="37" y2="20"/><polygon points="20,12 26,25 20,22 14,25" fill="#ffe600"/></svg>`
  },
  {
    id: 'ricochet',
    title: 'Prism Ricochet Core',
    category: '// PHOTONIC OPTICS',
    color: '#00f0ff',
    stat: '▸ +1 SMART BOUNCE | AUTO-REDIRECTS TO NEXT FOE',
    desc: 'Encases plasma bolts in a refractive prism lattice that rebounds off walls and enemies.',
    svg: `<svg viewBox="0 0 40 40" fill="none" stroke="#00f0ff" stroke-width="2.2"><polygon points="20,4 35,20 20,36 5,20" fill="rgba(0,240,255,0.2)"/><polyline points="6,12 20,20 34,10" stroke="#ffe600" stroke-width="2.5"/><circle cx="20" cy="20" r="3.5" fill="#ff0077"/></svg>`
  },
  {
    id: 'blackhole',
    title: 'Singularity Launcher',
    category: '// GRAVITATIONAL TECH',
    color: '#d946ef',
    stat: '▸ VORTEX PULL: 210m | SUPERNOVA COLLAPSE: 90 DMG',
    desc: 'Fires a dark-matter singularity orb that drags hostiles inward before violently detonating.',
    svg: `<svg viewBox="0 0 40 40" fill="none" stroke="#d946ef" stroke-width="2.3"><circle cx="20" cy="20" r="7" fill="#070210" stroke="#00f0ff" stroke-width="2.5"/><path d="M20 6C29 6 34 13 34 20C34 28 26 32 19 31"/><path d="M20 34C11 34 6 27 6 20C6 12 14 8 21 9"/><circle cx="20" cy="20" r="2.5" fill="#ffe600"/></svg>`
  },
  {
    id: 'speed',
    title: 'Ion Drift Thrusters',
    category: '// KINETIC CHASSIS',
    color: '#00ff88',
    stat: '▸ THRUST SPEED +20% | DASH COOLDOWN -16%',
    desc: 'Upgrades twin vector nozzles for razor-sharp strafing and rapid Phase-Rift Dash recovery.',
    svg: `<svg viewBox="0 0 40 40" fill="none" stroke="#00ff88" stroke-width="2.3"><polyline points="12,8 24,20 12,32"/><polyline points="21,8 33,20 21,32" stroke="#00f0ff"/><line x1="4" y1="14" x2="14" y2="14" stroke="#ffe600"/><line x1="2" y1="20" x2="16" y2="20" stroke="#ffe600"/><line x1="4" y1="26" x2="14" y2="26" stroke="#ffe600"/></svg>`
  },
  {
    id: 'emp',
    title: 'Chrono-Nova Dash',
    category: '// PHASE CAPACITOR',
    color: '#ff0077',
    stat: '▸ EMP RADIUS: 220m+ | 85+ VOLTAIC NOVA DMG',
    desc: 'Phase-dashing unleashes a high-voltage EMP shockwave that electrocutes surrounding foes.',
    svg: `<svg viewBox="0 0 40 40" fill="none" stroke="#ff0077" stroke-width="2.2"><circle cx="20" cy="20" r="15" stroke-dasharray="5 3"/><circle cx="20" cy="20" r="9" stroke="#00f0ff"/><polygon points="20,10 23,17 30,20 23,23 20,30 17,23 10,20 17,17" fill="#ffe600" stroke="none"/></svg>`
  },
  {
    id: 'shield',
    title: 'Aegis Energy Barrier',
    category: '// DEFENSIVE MATRIX',
    color: '#00f0ff',
    stat: '▸ +1 RECHARGING AEGIS LAYER | INSTANT +30 HULL',
    desc: 'Projects a hexagonal hard-light barrier that nullifies incoming damage and repairs hull.',
    svg: `<svg viewBox="0 0 40 40" fill="none" stroke="#00f0ff" stroke-width="2.3"><path d="M20 4L33 10V20C33 28.5 27.2 34.3 20 37C12.8 34.3 7 28.5 7 20V10L20 4Z" fill="rgba(0,240,255,0.22)"/><path d="M20 11L27 14.5V20C27 25 23.8 28.5 20 30.5C16.2 28.5 13 25 13 20V14.5L20 11Z" stroke="#00ff88" stroke-width="1.8"/></svg>`
  },
  {
    id: 'nanites',
    title: 'Vampiric Magnet Core',
    category: '// BIO-HARVESTER',
    color: '#00ff88',
    stat: '▸ MAGNET RANGE +75m | +20% XP | KILL LIFESTEAL',
    desc: 'Deploys gravitational tractor beams to vacuum data shards and siphon hull integrity on kills.',
    svg: `<svg viewBox="0 0 40 40" fill="none" stroke="#00ff88" stroke-width="2.3"><path d="M11 10V21C11 26 15 30 20 30C25 30 29 26 29 21V10" stroke="#00f0ff" stroke-width="3"/><rect x="8" y="7" width="6" height="5" fill="#ff0077" stroke="none"/><rect x="26" y="7" width="6" height="5" fill="#ff0077" stroke="none"/><path d="M20 14V22M16 18H24" stroke="#00ff88" stroke-width="2.5"/></svg>`
  }
];

let currentUpgradeChoices = [];

let selectedChassis = 'interceptor'; // 'interceptor' | 'titan' | 'phantom'

