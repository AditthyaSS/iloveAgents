import { describe, it, expect } from 'vitest';
import agent from './code-generator.js';

describe('code-generator agent definition', () => {

  // ── Identity ─────────────────────────────────────────────────────────────

  describe('identity', () => {
    it('has the correct id', () => {
      expect(agent.id).toBe('code-generator');
    });

    it('has a non-empty name', () => {
      expect(agent.name).toBeTruthy();
      expect(typeof agent.name).toBe('string');
    });

    it('has a non-empty description', () => {
      expect(agent.description).toBeTruthy();
      expect(typeof agent.description).toBe('string');
    });

    it('has a valid createdAt date string', () => {
      expect(agent.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('belongs to a valid category', () => {
      expect(typeof agent.category).toBe('string');
      expect(agent.category.length).toBeGreaterThan(0);
    });

    it('has an icon', () => {
      expect(typeof agent.icon).toBe('string');
      expect(agent.icon.length).toBeGreaterThan(0);
    });
  });

  // ── Provider / model ─────────────────────────────────────────────────────

  describe('provider and model', () => {
    it('has provider set to "any"', () => {
      expect(agent.provider).toBe('any');
    });

    it('has a defaultProvider', () => {
      expect(typeof agent.defaultProvider).toBe('string');
      expect(agent.defaultProvider.length).toBeGreaterThan(0);
    });

    it('has a model', () => {
      expect(typeof agent.model).toBe('string');
      expect(agent.model.length).toBeGreaterThan(0);
    });
  });

  // ── Inputs ───────────────────────────────────────────────────────────────

  describe('inputs', () => {
    it('is an array', () => {
      expect(Array.isArray(agent.inputs)).toBe(true);
    });

    it('has exactly 4 inputs', () => {
      expect(agent.inputs).toHaveLength(4);
    });

    it('every input has an id, label, and type', () => {
      for (const input of agent.inputs) {
        expect(input.id, `input "${input.id}" missing id`).toBeTruthy();
        expect(input.label, `input "${input.id}" missing label`).toBeTruthy();
        expect(input.type, `input "${input.id}" missing type`).toBeTruthy();
      }
    });

    describe('description input', () => {
      const input = () => agent.inputs.find((i) => i.id === 'description');

      it('exists', () => expect(input()).toBeDefined());
      it('is required', () => expect(input().required).toBe(true));
      it('is a textarea', () => expect(input().type).toBe('textarea'));
      it('has a placeholder', () => expect(input().placeholder).toBeTruthy());
    });

    describe('language input', () => {
      const input = () => agent.inputs.find((i) => i.id === 'language');

      it('exists', () => expect(input()).toBeDefined());
      it('is required', () => expect(input().required).toBe(true));
      it('is a select', () => expect(input().type).toBe('select'));
      it('has at least 5 language options', () => {
        expect(input().options.length).toBeGreaterThanOrEqual(5);
      });
      it('includes TypeScript as an option', () => {
        expect(input().options).toContain('TypeScript');
      });
      it('includes Python as an option', () => {
        expect(input().options).toContain('Python');
      });
      it('has a defaultValue', () => {
        expect(input().defaultValue).toBeTruthy();
      });
    });

    describe('style input', () => {
      const input = () => agent.inputs.find((i) => i.id === 'style');

      it('exists', () => expect(input()).toBeDefined());
      it('is required', () => expect(input().required).toBe(true));
      it('is a select', () => expect(input().type).toBe('select'));
      it('has at least 3 style options', () => {
        expect(input().options.length).toBeGreaterThanOrEqual(3);
      });
      it('has a defaultValue', () => {
        expect(input().defaultValue).toBeTruthy();
      });
    });

    describe('context input', () => {
      const input = () => agent.inputs.find((i) => i.id === 'context');

      it('exists', () => expect(input()).toBeDefined());
      it('is NOT required', () => expect(input().required).toBe(false));
      it('is a textarea', () => expect(input().type).toBe('textarea'));
    });
  });

  // ── Example inputs ───────────────────────────────────────────────────────

  describe('exampleInputs', () => {
    it('has exampleInputs object', () => {
      expect(typeof agent.exampleInputs).toBe('object');
      expect(agent.exampleInputs).not.toBeNull();
    });

    it('example description is a non-empty string', () => {
      expect(typeof agent.exampleInputs.description).toBe('string');
      expect(agent.exampleInputs.description.length).toBeGreaterThan(0);
    });

    it('example language matches one of the language options', () => {
      const languageInput = agent.inputs.find((i) => i.id === 'language');
      expect(languageInput.options).toContain(agent.exampleInputs.language);
    });

    it('example style matches one of the style options', () => {
      const styleInput = agent.inputs.find((i) => i.id === 'style');
      expect(styleInput.options).toContain(agent.exampleInputs.style);
    });
  });

  // ── System prompt ────────────────────────────────────────────────────────

  describe('systemPrompt', () => {
    it('is a non-empty string', () => {
      expect(typeof agent.systemPrompt).toBe('string');
      expect(agent.systemPrompt.length).toBeGreaterThan(100);
    });

    it('mentions the expected output sections', () => {
      expect(agent.systemPrompt).toContain('## Solution');
      expect(agent.systemPrompt).toContain('## How It Works');
      expect(agent.systemPrompt).toContain('## Usage Example');
      expect(agent.systemPrompt).toContain('## Notes');
    });

    it('contains coding rules', () => {
      expect(agent.systemPrompt).toContain('Rules:');
    });
  });

  // ── Output ───────────────────────────────────────────────────────────────

  describe('output', () => {
    it('has outputType set to "markdown"', () => {
      expect(agent.outputType).toBe('markdown');
    });

    it('has suggestedChainFrom as an array', () => {
      expect(Array.isArray(agent.suggestedChainFrom)).toBe(true);
    });

    it('suggestedChainFrom contains valid agent id strings', () => {
      for (const id of agent.suggestedChainFrom) {
        expect(typeof id).toBe('string');
        expect(id.length).toBeGreaterThan(0);
      }
    });
  });

});
