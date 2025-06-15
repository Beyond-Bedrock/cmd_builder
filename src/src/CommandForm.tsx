import { useState } from "react";
import type { CommandData, CommandParameter } from "./CommandBuilder";
import { toast } from "sonner";

interface CommandFormProps {
  command: CommandData;
  onChange: (command: CommandData) => void;
}

const PERMISSION_LEVELS = [
  { value: "0", label: "Any (0)" },
  { value: "1", label: "Game Directors (1)" },
  { value: "2", label: "Admin (2)" },
  { value: "3", label: "Host (3)" },
  { value: "4", label: "Owner (4)" },
];

const PARAMETER_TYPES = [
  { value: "BlockType", label: "Block Type" },
  { value: "Boolean", label: "Boolean" },
  { value: "EntitySelector", label: "Entity Selector" },
  { value: "EntityType", label: "Entity Type" },
  { value: "Enum", label: "Enum" },
  { value: "Float", label: "Floating Point Number" },
  { value: "Integer", label: "Whole Number" },
  { value: "ItemType", label: "Item Type" },
  { value: "Location", label: "3D Location" },
  { value: "PlayerSelector", label: "Player Selector" },
  { value: "String", label: "Text" },
];

export function CommandForm({ command, onChange }: CommandFormProps) {
  const [isOptional, setIsOptional] = useState(false);
  const [newParam, setNewParam] = useState<CommandParameter>({
    name: "",
    type: "String",
    description: "",
    enumName: ""
  });
  
  const [newEnum, setNewEnum] = useState<{name: string, values: string}>({
    name: "",
    values: ""
  });
  const [showEnumModal, setShowEnumModal] = useState(false);
  const [editingEnumIndex, setEditingEnumIndex] = useState<number | null>(null);

  const updateCommand = (updates: Partial<CommandData>) => {
    onChange({ ...command, ...updates });
  };

  const addParameter = () => {
    if (!newParam.name.trim()) return;
    
    const paramToAdd = { ...newParam };
    // Clear enumName if type is not Enum
    if (paramToAdd.type !== "Enum") {
      delete paramToAdd.enumName;
    }
    
    const paramsCount = command.optionalParameters?.length || command.mandatoryParameters?.length || 0;
    if (paramsCount > 7) {
      toast.error("Cannot add more than 8 parameters");
      return;
    }

    if (isOptional) {
      const params = [...(command.optionalParameters || []), paramToAdd];
      updateCommand({ optionalParameters: params });
    } else {
      const params = [...(command.mandatoryParameters || []), paramToAdd];
      updateCommand({ mandatoryParameters: params });
    }
    
    setNewParam({ name: "", type: "String", description: "", enumName: "" });
  };

  const removeParameter = (index: number, isOptional: boolean) => {
    if (isOptional) {
      const params = command.optionalParameters?.filter((_, i) => i !== index) || [];
      updateCommand({ optionalParameters: params });
    } else {
      const params = command.mandatoryParameters?.filter((_, i) => i !== index) || [];
      updateCommand({ mandatoryParameters: params });
    }
  };
  
  const addEnum = () => {
    if (!newEnum.name.trim() || !newEnum.values.trim()) return;
    
    const enumValues = newEnum.values.split(',').map(v => v.trim()).filter(Boolean);
    const updatedEnums = [...(command.enums || [])];
    
    if (editingEnumIndex !== null) {
      updatedEnums[editingEnumIndex] = { name: newEnum.name, values: enumValues };
    } else {
      updatedEnums.push({ name: newEnum.name, values: enumValues });
    }
    
    updateCommand({ enums: updatedEnums });
    setNewEnum({ name: "", values: "" });
    setEditingEnumIndex(null);
    setShowEnumModal(false);
  };
  
  const editEnum = (index: number) => {
    const enumToEdit = command.enums?.[index];
    if (!enumToEdit) return;
    
    setNewEnum({
      name: enumToEdit.name,
      values: enumToEdit.values.join(', ')
    });
    setEditingEnumIndex(index);
    setShowEnumModal(true);
  };
  
  const removeEnum = (index: number) => {
    const updatedEnums = [...(command.enums || [])];
    updatedEnums.splice(index, 1);
    updateCommand({ enums: updatedEnums });
  };

  return (
    <div className="space-y-6">
      {/* Basic Command Info */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Command Name *
          </label>
          <input
            type="text"
            value={command.name}
            onChange={(e) => updateCommand({ name: e.target.value })}
            placeholder="namespace:commandname"
            className="input"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Must include a namespace (e.g., "example:hello")
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Description *
          </label>
          <textarea
            value={command.description}
            onChange={(e) => updateCommand({ description: e.target.value })}
            placeholder="Describe what this command does..."
            className="input min-h-[100px] resize-y"
          />
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">
              Permission Level
            </label>
            <select
              value={command.permissionLevel}
              onChange={(e) => updateCommand({ permissionLevel: e.target.value })}
              className="input"
            >
              {PERMISSION_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center mt-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="cheatsRequired"
                checked={command.cheatsRequired !== false}
                onChange={(e) => updateCommand({ cheatsRequired: e.target.checked })}
                className="rounded border-gray-300 dark:border-gray-600 text-blue-500 focus:ring-blue-500 dark:bg-gray-700"
              />
              <label htmlFor="cheatsRequired" className="ml-2 text-sm">
                Requires Cheats
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Enums */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">Enums</h3>
          <button
            onClick={() => setShowEnumModal(true)}
            className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors"
          >
            Add Enum
          </button>
        </div>
        
        {command.enums?.length ? (
          <div className="space-y-2 mb-4">
            {command.enums.map((enumDef, index) => (
              <div key={enumDef.name} className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <div>
                  <span className="font-mono">{enumDef.name}</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                    ({enumDef.values.join(', ')})
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => editEnum(index)}
                    className="text-blue-500 hover:text-blue-600 p-1"
                    title="Edit enum"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => removeEnum(index)}
                    className="text-red-500 hover:text-red-600 p-1"
                    title="Remove enum"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            No enums defined. Add enums to use them as parameter types.
          </div>
        )}
      </div>
      
      {/* Parameters */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Parameters</h3>
        
        {/* Parameter List */}
        <div className="space-y-4 mb-6">
          {command.mandatoryParameters?.map((param, index) => (
            <div key={`mandatory-${index}`} className="flex items-start space-x-2  dark:bg-gray-800/30 p-3 rounded-lg border border-border">
              <div className="flex-1 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{param.name}</span>
                  <span className="text-sm text-foreground/80 dark:text-foreground/70">({param.type})</span>
                  <span className="text-xs bg-foreground/10 text-foreground/80 px-2 py-0.5 rounded-full">
                    Required
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex flex-col space-y-1">
                  <select
                    value={param.type}
                    onChange={(e) => updateCommand({ mandatoryParameters: command.mandatoryParameters?.map((p, i) => i === index ? { 
                      ...p, 
                      type: e.target.value,
                      enumName: e.target.value === 'Enum' ? (p.enumName || '') : undefined
                    } : p) })}
                    className="input text-sm w-32"
                  >
                    {PARAMETER_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {param.type === 'Enum' && (
                    <select
                      value={param.enumName || ''}
                      onChange={(e) => updateCommand({ mandatoryParameters: command.mandatoryParameters?.map((p, i) => i === index ? { ...p, enumName: e.target.value } : p) })}
                      className="input w-full text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select enum</option>
                      {command.enums?.map((enumDef) => (
                        <option key={enumDef.name} value={enumDef.name}>
                          {enumDef.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <button
                  onClick={() => removeParameter(index, false)}
                  className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-1"
                  title="Remove parameter"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {command.optionalParameters?.map((param, index) => (
            <div key={`optional-${index}`} className="flex items-start space-x-2  dark:bg-gray-800/30 p-3 rounded-lg border border-border">
              <div className="flex-1 space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{param.name}</span>
                  <span className="text-sm text-foreground/70 dark:text-foreground/60">({param.type})</span>
                  <span className="text-xs bg-foreground/5 text-foreground/70 px-2 py-0.5 rounded-full border border-border">
                    Optional
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <div className="flex flex-col space-y-1">
                  <select
                    value={param.type}
                    onChange={(e) => updateCommand({ optionalParameters: command.optionalParameters?.map((p, i) => i === index ? { 
                      ...p, 
                      type: e.target.value,
                      enumName: e.target.value === 'Enum' ? (p.enumName || '') : undefined
                    } : p) })}
                    className="input text-sm w-32"
                  >
                    {PARAMETER_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  {param.type === 'Enum' && (
                    <select
                      value={param.enumName || ''}
                      onChange={(e) => updateCommand({ optionalParameters: command.optionalParameters?.map((p, i) => i === index ? { ...p, enumName: e.target.value } : p) })}
                      className="input text-sm w-32 mt-1"
                    >
                      <option value="">Select enum</option>
                      {command.enums?.map((enumDef) => (
                        <option key={enumDef.name} value={enumDef.name}>
                          {enumDef.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <button
                  onClick={() => removeParameter(index, true)}
                  className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-1"
                  title="Remove parameter"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Add Parameter Form */}
        <div className=" dark: p-4 rounded-lg border border-border">
          <h4 className="text-md font-medium mb-3">Add New Parameter</h4>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Name</label>
              <input
                type="text"
                value={newParam.name}
                onChange={(e) => setNewParam({ ...newParam, name: e.target.value })}
                placeholder="parameter_name"
                className="input w-full text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Type</label>
              <select
                value={newParam.type}
                onChange={(e) => setNewParam({ 
                  ...newParam, 
                  type: e.target.value,
                  enumName: e.target.value === 'Enum' ? (newParam.enumName || '') : undefined
                })}
                className="input w-full text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
              >
                {PARAMETER_TYPES.map((type) => (
                  <option key={type.value} value={type.value} className="text-gray-900 dark:text-white">
                    {type.label}
                  </option>
                ))}
              </select>
              {newParam.type === 'Enum' && (
                <select
                  value={newParam.enumName || ''}
                  onChange={(e) => setNewParam({ ...newParam, enumName: e.target.value })}
                  className="input w-full text-foreground  border-border focus:ring-primary focus:border-primary mt-2"
                >
                  <option value="">Select enum</option>
                  {command.enums?.map((enumDef) => (
                    <option key={enumDef.name} value={enumDef.name}>
                      {enumDef.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="md:col-span-3 flex items-center space-x-2">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Optional</label>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input 
                    type="checkbox" 
                    id="isOptional"
                    checked={isOptional}
                    onChange={() => setIsOptional(!isOptional)}
                    className="sr-only"
                  />
                  <label 
                    htmlFor="isOptional"
                    className={`block overflow-hidden h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${isOptional ? 'bg-blue-500' : 'bg-gray-300'}`}
                  >
                    <span 
                      className={`block w-6 h-6 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out ${isOptional ? 'translate-x-4' : 'translate-x-0'}`}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <button
                onClick={addParameter}
                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-md transition-colors w-full btn-primary justify-center"
                disabled={!newParam.name.trim()}
                title="Add parameter"
              >+</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Enum Modal */}
      {showEnumModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className=" dark: rounded-lg p-6 w-full max-w-md border border-border bg-background">
            <h3 className="text-lg font-semibold mb-4">
              {editingEnumIndex !== null ? 'Edit Enum' : 'Add New Enum'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Enum Name *
                </label>
                <input
                  type="text"
                  value={newEnum.name}
                  onChange={(e) => setNewEnum({...newEnum, name: e.target.value})}
                  placeholder="namespace:enum_name"
                  className="input w-full"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Must include a namespace (e.g., "example:dimension")
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                  Values (comma-separated) *
                </label>
                <textarea
                  value={newEnum.values}
                  onChange={(e) => setNewEnum({...newEnum, values: e.target.value})}
                  placeholder="value1, value2, value3"
                  className="input w-full min-h-[100px] resize-y"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Separate values with commas (e.g., "overworld, nether, the_end")
                </p>
              </div>
              
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  onClick={() => {
                    setShowEnumModal(false);
                    setNewEnum({ name: "", values: "" });
                    setEditingEnumIndex(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={addEnum}
                  disabled={!newEnum.name.trim() || !newEnum.values.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingEnumIndex !== null ? 'Update Enum' : 'Add Enum'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
