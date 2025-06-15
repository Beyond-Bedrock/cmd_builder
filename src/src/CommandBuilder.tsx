import { useState } from "react";
import { CommandForm } from "./CommandForm";
import { CommandPreview } from "./CommandPreview";

export interface CommandParameter {
  name: string;
  type: string;
  description?: string;
  defaultValue?: string;
  enumName?: string;
}

export interface EnumDefinition {
  name: string;
  values: string[];
}

export interface CommandData {
  name: string;
  description: string;
  cheatsRequired?: boolean;
  permissionLevel: string;
  enums?: EnumDefinition[];
  mandatoryParameters?: CommandParameter[];
  optionalParameters?: CommandParameter[];
}

export function CommandBuilder() {
  const [currentCommand, setCurrentCommand] = useState<CommandData>({
    name: "",
    description: "",
    cheatsRequired: true,
    permissionLevel: "1",
    mandatoryParameters: [],
    optionalParameters: [],
  });

  return (
    <div className="p-4">
      <div className="max-w-6xl mx-auto">        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className=" dark: rounded-lg border border-border p-4 shadow-sm">
            <CommandForm
              command={currentCommand}
              onChange={setCurrentCommand}
            />
          </div>
          <div className=" dark: rounded-lg border border-border p-4 shadow-sm">
            <CommandPreview command={currentCommand} />
          </div>
        </div>
      </div>
    </div>
  );
}
