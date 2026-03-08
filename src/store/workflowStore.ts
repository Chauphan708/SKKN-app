import { useProjectStore } from './projectStore';
import { useUIStore } from './uiStore';

// Proxy store for backward compatibility during transition
export const useWorkflowStore = () => {
    const project = useProjectStore();
    const ui = useUIStore();

    return {
        ...project,
        ...ui,
        // Map any naming differences if necessary
    };
};
