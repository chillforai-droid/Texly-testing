/**
 * PATCH: Add event listener support to TexlyAIAssistant.tsx
 * 
 * Add this import at top of TexlyAIAssistant.tsx:
 *   import { useAIMessages } from './useTexlyAI';
 * 
 * Then inside the TexlyAIAssistant function body, after the dragPos state:
 *   useAIMessages((text) => {
 *     addAssistantMessage(text);
 *     setIsOpen(true);
 *   });
 *
 * This allows useToolSuccess and useToolFailure hooks to
 * inject messages into the chat from anywhere in the app.
 */

// This file documents the integration patch.
// The actual hook is in useTexlyAI.ts.
// See integration guide below.

export {};
