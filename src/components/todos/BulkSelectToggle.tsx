/**
 * BulkSelectToggle Component
 * 
 * A toggle switch component that enables/disables bulk selection mode for todos.
 * When enabled, it allows users to select multiple todos for batch operations
 * like moving to folders, toggling completion status, or deletion.
 * 
 * @component
 * 
 * Key Features:
 * - Toggle switch for bulk selection mode
 * - Visual feedback for current state
 * - Accessible controls with ARIA attributes
 * - Smooth transitions and animations
 * 
 * Integration Points:
 * 1. Parent Component:
 *    - TodoList manages bulk selection state
 *    - Controls visibility of selection checkboxes
 *    - Handles bulk operations
 * 
 * 2. Related Components:
 *    - BulkActionsBar appears when items are selected
 *    - TodoItem shows selection checkboxes
 *    - useBulkActions hook manages state
 * 
 * Data Flow:
 * 1. User toggles bulk selection mode:
 *    - Component updates visual state
 *    - Parent receives toggle event
 *    - TodoList shows/hides checkboxes
 * 
 * 2. Selection Process:
 *    - Users can select multiple todos
 *    - BulkActionsBar appears
 *    - Batch operations become available
 * 
 * 3. Mode Disable:
 *    - Clears all selections
 *    - Hides checkboxes
 *    - Removes BulkActionsBar
 * 
 * Accessibility:
 * - Proper ARIA roles and labels
 * - Keyboard navigation support
 * - High contrast visual states
 */

import React from 'react';

interface BulkSelectToggleProps {
  /** Whether bulk selection mode is currently enabled */
  isEnabled: boolean;
  /** Callback function when toggle state changes */
  onToggle: (enabled: boolean) => void;
}

export default function BulkSelectToggle({ isEnabled, onToggle }: BulkSelectToggleProps) {
  return (
    <div 
      className="flex items-center space-x-2"
      role="group"
      aria-labelledby="bulk-select-label"
    >
      <label 
        id="bulk-select-label"
        htmlFor="bulkSelect" 
        className="text-sm text-gray-600"
      >
        Bulk Select
      </label>
      <button
        id="bulkSelect"
        onClick={() => onToggle(!isEnabled)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isEnabled ? 'bg-indigo-600' : 'bg-gray-200'
        }`}
        role="switch"
        aria-checked={isEnabled}
        aria-label="Enable bulk selection mode"
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isEnabled ? 'translate-x-6' : 'translate-x-1'
          }`}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}

/**
 * Component Usage Example:
 * 
 * ```tsx
 * import BulkSelectToggle from './components/todos/BulkSelectToggle';
 * import { useBulkActions } from '../../hooks/useBulkActions';
 * 
 * function TodoList() {
 *   const {
 *     showBulkSelect,
 *     setShowBulkSelect,
 *     setSelectedTodos
 *   } = useBulkActions(todos, setTodos);
 * 
 *   return (
 *     <BulkSelectToggle
 *       isEnabled={showBulkSelect}
 *       onToggle={(enabled) => {
 *         setShowBulkSelect(enabled);
 *         if (!enabled) {
 *           setSelectedTodos(new Set());
 *         }
 *       }}
 *     />
 *   );
 * }
 * ```
 * 
 * @see {@link useBulkActions} For bulk actions state management
 * @see {@link TodoList} For parent component implementation
 * @see {@link BulkActionsBar} For bulk operations UI
 * @see {@link TodoItem} For selection checkbox implementation
 */