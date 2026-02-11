// Debug utility for conditional logging
// This allows us to enable/disable debug logs globally

let debugEnabled = false;

export const setDebugMode = (enabled) => {
  debugEnabled = enabled;
  if (enabled) {
    console.log('🐛 Debug mode ENABLED');
  } else {
    console.log('🐛 Debug mode DISABLED');
  }
};

export const isDebugEnabled = () => debugEnabled;

// Conditional console.log
export const debugLog = (...args) => {
  if (debugEnabled) {
    console.log(...args);
  }
};

// Conditional console.warn
export const debugWarn = (...args) => {
  if (debugEnabled) {
    console.warn(...args);
  }
};

// Conditional console.error
export const debugError = (...args) => {
  if (debugEnabled) {
    console.error(...args);
  }
};

// Conditional console.table
export const debugTable = (...args) => {
  if (debugEnabled) {
    console.table(...args);
  }
};

// Conditional console.group
export const debugGroup = (label) => {
  if (debugEnabled) {
    console.group(label);
  }
};

export const debugGroupEnd = () => {
  if (debugEnabled) {
    console.groupEnd();
  }
};
