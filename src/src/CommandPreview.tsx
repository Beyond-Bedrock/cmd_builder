import { useEffect, useRef, useState } from "react";
import type { CommandData } from "./CommandBuilder";
import { toast } from "sonner";
import { useDarkMode } from "./hooks/useDarkMode";

interface CommandPreviewProps {
  command: CommandData;
}

const PERMISSION_LEVEL_NAMES: Record<string, string> = {
  "0": "Any",
  "1": "GameDirectors",
  "2": "Admin",
  "3": "Host",
  "4": "Owner",
};

type Language = 'typescript' | 'javascript';

export function CommandPreview({ command }: CommandPreviewProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cmInstance = useRef<any>(null);
  const { isDarkMode } = useDarkMode();
  const [theme, setTheme] = useState(isDarkMode ? 'material' : 'default');
  const [language, setLanguage] = useState<Language>('typescript');

  const generateJavaScriptCode = () => {
    const commandVar = command.name ? command.name.split(":")[1] + "Cmd" : "myCmd";
    const functionName = command.name ? command.name.split(":")[1] + "Handler" : "commandHandler";

    const allParams = [...(command.mandatoryParameters || []), ...(command.optionalParameters || [])];
    
    // Handle duplicate parameter names by appending numbers
    const usedNames = new Set<string>();
    const getUniqueName = (baseName: string) => {
      if (!usedNames.has(baseName)) {
        usedNames.add(baseName);
        return baseName;
      }
      
      let counter = 1;
      let newName = `${baseName}${counter}`;
      while (usedNames.has(newName)) {
        counter++;
        newName = `${baseName}${counter}`;
      }
      usedNames.add(newName);
      return newName;
    };

    // Generate unique parameter names
    const paramNames = allParams.map(param => {
      const baseName = param.name.trim() || 'param';
      return getUniqueName(baseName);
    });

    const paramSignature = paramNames.length > 0
      ? `, ${paramNames.join(", ")}`
      : "";

    const parameterLogs = paramNames.map((name, index) => {
      const param = allParams[index];
      return `  console.log('Parameter ${param.name}:', ${name});`;
    }).join("\n");

    // Generate enum registrations
    const enumRegistrations = command.enums?.map(enumDef => 
      `  const ${enumDef.name.split(':').pop()?.replace(/[^a-zA-Z0-9_]/g, '_')}Enum = ${JSON.stringify(enumDef.values)};
  init.customCommandRegistry.registerEnum("${enumDef.name}", ${enumDef.name.split(':').pop()?.replace(/[^a-zA-Z0-9_]/g, '_')}Enum);`
    ).join('\n\n') || '  // No enums defined';


    // Generate parameter definitions for JavaScript
    const generateJSParameterDefinitions = () => {
      let result = "";
  
      if (command.mandatoryParameters?.length) {
        result += ",\n    mandatoryParameters: [\n      " +
          command.mandatoryParameters.map(param => `{\n        type: CustomCommandParamType.${param.type},\n        name: \"${param.name}\"${param.type === 'Enum' && param.enumName ? `,\n        enumName: \"${param.enumName}\"` : ''}${param.description ? `,\n        description: \"${param.description}\"` : ""}\n      }`).join(",\n      ") +
          "\n    ]";
      }
  
      if (command.optionalParameters?.length) {
        result += ",\n    optionalParameters: [\n      " +
          command.optionalParameters.map(param => `{\n        type: CustomCommandParamType.${param.type},\n        name: \"${param.name}\"${param.type === 'Enum' && param.enumName ? `,\n        enumName: \"${param.enumName}\"` : ''}${param.description ? `,\n        description: \"${param.description}\"` : ""}${param.defaultValue ? `,\n        defaultValue: \"${param.defaultValue}\"` : ""}\n      }`).join(",\n      ") +
          "\n    ]";
      }
  
      return result;
    };

    return `import {
  system,
  CommandPermissionLevel,
  CustomCommandParamType,
  CustomCommandStatus
} from "@minecraft/server";

system.beforeEvents.startup.subscribe((init) => {
${enumRegistrations}

  const ${commandVar} = {
    name: "${command.name || "namespace:command"}",
    description: "${command.description || "My custom command"}",
    permissionLevel: CommandPermissionLevel.${PERMISSION_LEVEL_NAMES[command.permissionLevel] || "Any"},
    cheatsRequired: ${command.cheatsRequired !== undefined ? command.cheatsRequired : true}${generateJSParameterDefinitions()}
  };

  init.customCommandRegistry.registerCommand(${commandVar}, ${functionName});
});

function ${functionName}(origin${paramSignature}) {
${parameterLogs || "  // No parameters to log"}
  return { status: CustomCommandStatus.Success };
}`;
  };

  const generateTypeScriptCode = () => {
    const commandVar = command.name ? command.name.split(":")[1] + "Cmd" : "myCmd";
    const functionName = command.name ? command.name.split(":")[1] + "Handler" : "commandHandler";

    const allParams = [...(command.mandatoryParameters || []), ...(command.optionalParameters || [])];
    
    // Handle duplicate parameter names by appending numbers
    const usedNames = new Set<string>();
    const getUniqueName = (baseName: string) => {
      if (!usedNames.has(baseName)) {
        usedNames.add(baseName);
        return baseName;
      }
      
      let counter = 1;
      let newName = `${baseName}${counter}`;
      while (usedNames.has(newName)) {
        counter++;
        newName = `${baseName}${counter}`;
      }
      usedNames.add(newName);
      return newName;
    };

    // Generate unique parameter names with types
    const paramDefinitions = allParams.map(param => {
      const baseName = param.name.trim() || 'param';
      const uniqueName = getUniqueName(baseName);
      return {
        ...param,
        uniqueName,
        typeDef: getTypeScriptType(param.type)
      };
    });

    const paramSignature = paramDefinitions.length > 0
      ? `, ${paramDefinitions.map(p => `${p.uniqueName}: ${p.typeDef}`).join(", ")}`
      : "";

    const parameterLogs = paramDefinitions.map(p =>
      `  console.log('Parameter ${p.name}:', ${p.uniqueName});`
    ).join("\n");

    // Generate enum registrations
    const enumRegistrations = command.enums?.map(enumDef => 
      `  const ${enumDef.name.split(':').pop()?.replace(/[^a-zA-Z0-9_]/g, '_')}Enum = ${JSON.stringify(enumDef.values)};
  init.customCommandRegistry.registerEnum("${enumDef.name}", ${enumDef.name.split(':').pop()?.replace(/[^a-zA-Z0-9_]/g, '_')}Enum);`
    ).join('\n\n') || '  // No enums defined';


    return `import {
  system,
  StartupEvent,
  CommandPermissionLevel,
  CustomCommand,
  CustomCommandParamType,
  CustomCommandOrigin,
  CustomCommandStatus,
  CustomCommandResult,
} from "@minecraft/server";

system.beforeEvents.startup.subscribe((init: StartupEvent) => {
${enumRegistrations}

  const ${commandVar}: CustomCommand = {
    name: "${command.name || "namespace:command"}",
    description: "${command.description || "My custom command"}",
    permissionLevel: CommandPermissionLevel.${PERMISSION_LEVEL_NAMES[command.permissionLevel] || "Any"},
    cheatsRequired: ${command.cheatsRequired !== undefined ? command.cheatsRequired : true}${generateParameterDefinitions()}
  };

  init.customCommandRegistry.registerCommand(${commandVar}, ${functionName});
});

function ${functionName}(origin: CustomCommandOrigin${paramSignature}): CustomCommandResult {
${parameterLogs || "  // No parameters to log"}
  return { status: CustomCommandStatus.Success };
}`;
  };

  const generateParameterDefinitions = () => {
    let result = "";
    let paramIndex = 0;

    if (command.mandatoryParameters?.length) {
      result += ",\n    mandatoryParameters: [\n      " +
      command.mandatoryParameters.map(param => `{\n        type: CustomCommandParamType.${param.type},${param.type === 'Enum' && param.enumName ? `\n        enumName: \"${param.enumName}\",` : ''}\n        name: \"${param.name}\"${param.description ? `,\n        description: \"${param.description}\"` : ""}\n      }`).join(",\n      ") +
      "\n    ]";
      paramIndex += command.mandatoryParameters.length;
    }

    if (command.optionalParameters?.length) {
      result += ",\n    optionalParameters: [\n      " +
      command.optionalParameters.map(param => `{\n        type: CustomCommandParamType.${param.type},${param.type === 'Enum' && param.enumName ? `\n        enumName: \"${param.enumName}\",` : ''}\n        name: \"${param.name}\"${param.description ? `,\n        description: \"${param.description}\"` : ""}${param.defaultValue ? `,\n        defaultValue: \"${param.defaultValue}\"` : ""}\n      }`).join(",\n      ") +
      "\n    ]";
    }

    return result;
  };

  const getTypeScriptType = (paramType: string) => {
    switch (paramType) {
      case "String": return "string";
      case "Integer":
      case "Float": return "number";
      case "Boolean": return "boolean";
      case "Location": return "Vector3";
      case "BlockType":
      case "EntityType":
      case "ItemType":
        return `${paramType} | string`;
      case "EntitySelector":
      case "PlayerSelector":
        return `Entity[]`;
      case "Enum":
        return "string";
      default: return "any";
    }
  };

  useEffect(() => {
    if (!textareaRef.current) return;
    // Access global CodeMirror from window
    const CodeMirror = (window as any).CodeMirror;
    if (!CodeMirror) {
      console.error("CodeMirror not loaded from CDN");
      return;
    }

    // If already initialized, destroy previous instance
    if (cmInstance.current) {
      cmInstance.current.toTextArea();
      cmInstance.current = null;
    }

    cmInstance.current = CodeMirror.fromTextArea(textareaRef.current, {
      mode: "text/typescript",
      theme: isDarkMode ? 'material' : 'default',
      lineNumbers: true,
      readOnly: true,
      lineWrapping: true,
      styleActiveLine: true,
      matchBrackets: true,
      autoCloseBrackets: true,
      indentUnit: 2,
      tabSize: 2,
      extraKeys: {"Ctrl-Space": "autocomplete"},
      gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
      foldGutter: true,
    });

    cmInstance.current.setValue(generateTypeScriptCode());
    cmInstance.current.setSize("100%", "100%");

    return () => {
      if (cmInstance.current) {
        cmInstance.current.toTextArea();
        cmInstance.current = null;
      }
    };
  }, []);

  // Update code in editor when command or language changes
  useEffect(() => {
    if (cmInstance.current) {
      const code = language === 'typescript' ? generateTypeScriptCode() : generateJavaScriptCode();
      cmInstance.current.setValue(code);
      cmInstance.current.setSize("100%", "100%");
      // Update the mode based on language
      cmInstance.current.setOption('mode', `text/${language}`);
    }
  }, [command, language]);

  // Observe theme changes on the document element
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          const newTheme = isDark ? 'material' : 'default';
          setTheme(newTheme);
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  // Update CodeMirror when theme changes
  useEffect(() => {
    if (cmInstance.current) {
      cmInstance.current.setOption('theme', theme);
      // Force refresh the editor to apply theme properly
      const wrapper = cmInstance.current.getWrapperElement();
      wrapper.className = wrapper.className.replace(/\s*cm-s-\S+/g, '') + ' cm-s-' + theme;
      cmInstance.current.refresh();
    }
  }, [theme]);

  const copyCode = () => {
    if (cmInstance.current) {
      navigator.clipboard.writeText(cmInstance.current.getValue());
      toast.success("Code copied to clipboard!");
    }
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h2 className="text-xl font-semibold">Generated Code</h2>
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <button
              onClick={() => setLanguage('typescript')}
              className={`px-3 py-1 text-sm font-medium rounded-l-md ${
                language === 'typescript' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              TypeScript
            </button>
            <button
              onClick={() => setLanguage('javascript')}
              className={`px-3 py-1 text-sm font-medium rounded-r-md ${
                language === 'javascript' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              JavaScript
            </button>
          </div>
        </div>
        <button
          onClick={copyCode}
          className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          title="Copy to clipboard"
        >
          Copy
        </button>
      </div>
      <div className="flex-1 overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
        <textarea ref={textareaRef} className="hidden" />
      </div>
    </div>
  );
}
