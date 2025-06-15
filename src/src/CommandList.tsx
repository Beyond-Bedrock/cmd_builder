import { toast } from "sonner";
import { useDarkMode } from "./hooks/useDarkMode";
import type { CommandData } from "./CommandBuilder";

interface CommandListProps {
  commands: (CommandData & { id: string })[];
  onEdit: (command: CommandData & { id: string }) => void;
  onDelete: (id: string) => void;
}

export function CommandList({ commands, onEdit, onDelete }: CommandListProps) {
  const { isDarkMode } = useDarkMode();

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this command?")) {
      onDelete(id);
    }
  };

  if (commands.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400">No commands saved yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {commands.map((command) => (
        <div
          key={command.id}
          className=" dark: p-4 rounded-lg shadow-sm border border-border"
        >
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-lg font-semibold dark:text-white">
                {command.name || "Untitled Command"}
              </h3>
              {command.description && (
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                  {command.description}
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(command)}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(command.id)}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            <p>Permission Level: {command.permissionLevel}</p>
            {command.cheatsRequired && (
              <p className="text-yellow-600 dark:text-yellow-500">
                Requires Cheats
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
