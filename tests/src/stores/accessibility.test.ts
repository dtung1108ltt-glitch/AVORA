import { describe, it, expect, beforeEach } from 'vitest';
import { useAccessibility, DEFAULT_ACCESSIBILITY_SETTINGS } from '../../../apps/web/src/store/accessibility.store';

beforeEach(() => {
  useAccessibility.setState({ settings: { ...DEFAULT_ACCESSIBILITY_SETTINGS } });
});

describe('useAccessibility store', () => {
  describe('initial state', () => {
    it('should have default settings', () => {
      const { settings } = useAccessibility.getState();
      expect(settings.fontSize).toBe(100);
      expect(settings.highContrast).toBe(false);
      expect(settings.reducedMotion).toBe(false);
      expect(settings.voiceNavigation).toBe(false);
      expect(settings.keyboardOnly).toBe(false);
      expect(settings.screenReaderOptimized).toBe(false);
      expect(settings.extraTime).toBe(false);
      expect(settings.preferredInput).toBe('text');
      expect(settings.theme).toBe('light');
    });
  });

  describe('setFontSize', () => {
    it('should update font size', () => {
      useAccessibility.getState().setFontSize(150);
      expect(useAccessibility.getState().settings.fontSize).toBe(150);
    });

    it('should clamp font size to minimum 100', () => {
      useAccessibility.getState().setFontSize(50);
      expect(useAccessibility.getState().settings.fontSize).toBe(100);
    });

    it('should clamp font size to maximum 200', () => {
      useAccessibility.getState().setFontSize(250);
      expect(useAccessibility.getState().settings.fontSize).toBe(200);
    });
  });

  describe('toggleHighContrast', () => {
    it('should toggle from false to true', () => {
      useAccessibility.getState().toggleHighContrast();
      expect(useAccessibility.getState().settings.highContrast).toBe(true);
    });

    it('should toggle back to false', () => {
      useAccessibility.getState().toggleHighContrast();
      useAccessibility.getState().toggleHighContrast();
      expect(useAccessibility.getState().settings.highContrast).toBe(false);
    });
  });

  describe('setPreferredInput', () => {
    it('should set preferred input to voice', () => {
      useAccessibility.getState().setPreferredInput('voice');
      expect(useAccessibility.getState().settings.preferredInput).toBe('voice');
    });

    it('should set preferred input to eye-tracking', () => {
      useAccessibility.getState().setPreferredInput('eye-tracking');
      expect(useAccessibility.getState().settings.preferredInput).toBe('eye-tracking');
    });
  });

  describe('resetSettings', () => {
    it('should restore all settings to defaults', () => {
      useAccessibility.getState().setFontSize(175);
      useAccessibility.getState().toggleHighContrast();
      useAccessibility.getState().setPreferredInput('switch');
      useAccessibility.getState().resetSettings();
      const { settings } = useAccessibility.getState();
      expect(settings.fontSize).toBe(100);
      expect(settings.highContrast).toBe(false);
      expect(settings.preferredInput).toBe('text');
    });
  });

  describe('updateSettings', () => {
    it('should partially update settings', () => {
      useAccessibility.getState().updateSettings({ reducedMotion: true, theme: 'dark' });
      const { settings } = useAccessibility.getState();
      expect(settings.reducedMotion).toBe(true);
      expect(settings.theme).toBe('dark');
      expect(settings.fontSize).toBe(100);
    });
  });
});
