// Web Audio API synthesized sound engine for Zain Center Management System
// High performance, zero latency, no external assets needed, works 100% offline.

class SoundService {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private touchSoundEnabled: boolean = true;
  private navSoundEnabled: boolean = true;
  private notifSoundEnabled: boolean = true;
  private volume: number = 0.35; // default pleasant volume
  private lastClickTime: number = 0;
  private isInitialized: boolean = false;

  constructor() {
    this.loadPreferences();
    if (typeof window !== 'undefined') {
      this.attachGlobalTouchHandler();
    }
  }

  private loadPreferences() {
    try {
      const storedEnabled = localStorage.getItem('zain_sound_enabled');
      if (storedEnabled !== null) {
        this.soundEnabled = storedEnabled === 'true';
      }

      const storedTouch = localStorage.getItem('zain_sound_touch_enabled');
      if (storedTouch !== null) {
        this.touchSoundEnabled = storedTouch === 'true';
      }

      const storedNav = localStorage.getItem('zain_sound_nav_enabled');
      if (storedNav !== null) {
        this.navSoundEnabled = storedNav === 'true';
      }

      const storedNotif = localStorage.getItem('zain_sound_notif_enabled');
      if (storedNotif !== null) {
        this.notifSoundEnabled = storedNotif === 'true';
      }

      const storedVol = localStorage.getItem('zain_sound_volume');
      if (storedVol !== null) {
        const parsed = parseFloat(storedVol);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          this.volume = parsed;
        }
      }
    } catch {
      // Ignore storage errors in restricted contexts
    }
  }

  private savePreferences() {
    try {
      localStorage.setItem('zain_sound_enabled', String(this.soundEnabled));
      localStorage.setItem('zain_sound_touch_enabled', String(this.touchSoundEnabled));
      localStorage.setItem('zain_sound_nav_enabled', String(this.navSoundEnabled));
      localStorage.setItem('zain_sound_notif_enabled', String(this.notifSoundEnabled));
      localStorage.setItem('zain_sound_volume', String(this.volume));
      window.dispatchEvent(new CustomEvent('zain-sound-preferences-changed', {
        detail: {
          enabled: this.soundEnabled,
          touchEnabled: this.touchSoundEnabled,
          navEnabled: this.navSoundEnabled,
          notifEnabled: this.notifSoundEnabled,
          volume: this.volume,
        },
      }));
    } catch {
      // Ignore storage errors
    }
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  public init() {
    if (this.isInitialized) return;
    this.isInitialized = true;
    this.getAudioContext();
  }

  // --- Preference getters and setters ---
  public getPreferences() {
    return {
      enabled: this.soundEnabled,
      touchEnabled: this.touchSoundEnabled,
      navigationEnabled: this.navSoundEnabled,
      notificationsEnabled: this.notifSoundEnabled,
      volume: this.volume,
    };
  }

  public isEnabled(): boolean {
    return this.soundEnabled;
  }

  public setEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
    this.savePreferences();
    if (enabled) {
      this.playClick();
    }
  }

  public isTouchEnabled(): boolean {
    return this.touchSoundEnabled;
  }

  public setTouchEnabled(enabled: boolean) {
    this.touchSoundEnabled = enabled;
    this.savePreferences();
    if (enabled) {
      this.playClick();
    }
  }

  public isNavEnabled(): boolean {
    return this.navSoundEnabled;
  }

  public setNavEnabled(enabled: boolean) {
    this.navSoundEnabled = enabled;
    this.savePreferences();
    if (enabled) {
      this.playNavigation();
    }
  }

  public setNavigationEnabled(enabled: boolean) {
    this.setNavEnabled(enabled);
  }

  public isNotificationEnabled(): boolean {
    return this.notifSoundEnabled;
  }

  public setNotificationEnabled(enabled: boolean) {
    this.notifSoundEnabled = enabled;
    this.savePreferences();
    if (enabled) {
      this.playNotification('success');
    }
  }

  public setNotificationsEnabled(enabled: boolean) {
    this.setNotificationEnabled(enabled);
  }

  public getVolume(): number {
    return this.volume;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    this.savePreferences();
  }

  // =========================================================================
  // SOUND GENERATION ALGORITHMS (Web Audio Synthesizer)
  // =========================================================================

  /**
   * Startup Sound: Warm harmonic welcoming chord when entering system or opening app
   */
  public playStartup() {
    if (!this.soundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Chords: C4, G4, C5, E5, G5, C6 (Pristine inspiring chime)
      const frequencies = [261.63, 392.0, 523.25, 659.25, 783.99, 1046.5];
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(this.volume * 0.7, now);
      masterGain.connect(ctx.destination);

      frequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = index === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.04);

        // Soft bell-like envelope
        const startTime = now + index * 0.04;
        const duration = 1.3 - index * 0.1;
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.25 / (index * 0.5 + 1), startTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

        osc.connect(gain);
        gain.connect(masterGain);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch {
      // Audio fallback silent
    }
  }

  /**
   * Touch / Click Sound: Ultra subtle, crisp, satisfying micro-tap
   */
  public playClick() {
    if (!this.soundEnabled || !this.touchSoundEnabled) return;
    const nowMs = Date.now();
    if (nowMs - this.lastClickTime < 45) return; // Prevent double trigger jitter
    this.lastClickTime = nowMs;

    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Crisp frequency drop (850Hz -> 300Hz in 30ms) - feels like premium tactile tap
      osc.frequency.setValueAtTime(850, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.035);

      gain.gain.setValueAtTime(this.volume * 0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.045);
    } catch {
      // Silently catch
    }
  }

  /**
   * Navigation Sound: Clean aerodynamic soft two-tone transition
   */
  public playNavigation() {
    if (!this.soundEnabled || !this.navSoundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [440, 659.25]; // A4 -> E5 pleasant swoosh

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.05;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.08, startTime + 0.08);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(this.volume * 0.28, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.13);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Notification Sound: Pleasant chime tailored to type
   */
  public playNotification(type: 'success' | 'info' | 'error' = 'success') {
    if (!this.soundEnabled || !this.notifSoundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      if (type === 'success') {
        // Bright pleasant 3-note ascending arpeggio (C5 -> E5 -> G5)
        const notes = [523.25, 659.25, 783.99];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = now + i * 0.08;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, start);

          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(this.volume * 0.45, start + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(start);
          osc.stop(start + 0.4);
        });
      } else if (type === 'info') {
        // Soft twin glass bell (F#5 -> B5)
        const notes = [739.99, 987.77];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = now + i * 0.07;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, start);

          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(this.volume * 0.35, start + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.3);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(start);
          osc.stop(start + 0.35);
        });
      } else {
        // Error / Warning: Soft low double pulse (G4 -> Eb4)
        const notes = [392.0, 311.13];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const start = now + i * 0.1;

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, start);

          gain.gain.setValueAtTime(0, start);
          gain.gain.linearRampToValueAtTime(this.volume * 0.25, start + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(start);
          osc.stop(start + 0.25);
        });
      }
    } catch {
      // Ignore
    }
  }

  /**
   * Action Success Chime (payment saved, student created, attendance recorded)
   */
  public playSuccess() {
    this.playNotification('success');
  }

  /**
   * Modal Open / Close Tone
   */
  public playModal(open: boolean) {
    if (!this.soundEnabled || !this.touchSoundEnabled) return;
    const ctx = this.getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      if (open) {
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(580, now + 0.07);
      } else {
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(280, now + 0.06);
      }

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(this.volume * 0.25, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Ignore
    }
  }

  /**
   * Global Touch / Click Handler:
   * Attaches to document and detects interactive element clicks / touches
   */
  private attachGlobalTouchHandler() {
    const handleTouchOrClick = (e: Event) => {
      // Wake up audio context on user gesture
      this.init();

      if (!this.soundEnabled || !this.touchSoundEnabled) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // Check if target or parent is an interactive button, link, or tab
      const isInteractive = target.closest(
        'button, a, [role="button"], [role="tab"], input[type="submit"], input[type="button"], input[type="checkbox"], input[type="radio"], select, .cursor-pointer, [data-sound="touch"]'
      );

      if (isInteractive) {
        // If it explicitly asks not to play sound
        if (target.closest('[data-sound="none"]')) return;

        this.playClick();
      }
    };

    // Use pointerdown / touchstart for zero-latency haptic feel
    window.addEventListener('pointerdown', handleTouchOrClick, { passive: true });
  }
}

export const soundService = new SoundService();
