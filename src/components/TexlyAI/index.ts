/**
 * TexlyAI Module - Main exports
 * 
 * Import from here in your components:
 *   import TexlyAIAssistant from './components/TexlyAI';
 *   import { useToolSuccess, useToolFailure, aiDoTextWork } from './components/TexlyAI';
 */

export { default } from './TexlyAIAssistant';
export { useToolSuccess, useToolFailure, emitAIMessage } from './useTexlyAI';
export { aiDoTextWork } from './texlyAIEngine';
export { detectLang } from './texlyPersonality';
