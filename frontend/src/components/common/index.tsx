import React from "react";

export const Loading: React.FC = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="inline-block">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
        </div>
        <p className="mt-4 text-gray-400">Calculating...</p>
      </div>
    </div>
  );
};

interface ErrorDetail {
  code?: string;
  message?: string;
  help?: string;
  details?: string;
}

interface ErrorMessageProps {
  message: string | ErrorDetail;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  // Handle both string and object error messages
  let errorCode = "ERR_UNKNOWN";
  let errorMessage = "An error occurred";
  let helpText = "Please try again or contact support";
  let detailsText = "";

  if (typeof message === "object" && message !== null) {
    errorCode = message.code || "ERR_UNKNOWN";
    errorMessage = message.message || "An error occurred";
    helpText = message.help || "Please try again or contact support";
    detailsText = message.details || "";
    
    // Log technical details to console for developers
    if (detailsText) {
      console.error(`[${errorCode}] Technical Details:`, detailsText);
    }
  } else if (typeof message === "string") {
    errorMessage = message;
  }

  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
      <div className="flex items-start gap-3">
        <div className="text-xl mt-0.5">⚠️</div>
        <div className="flex-1">
          <p className="font-semibold text-red-300">{errorMessage}</p>
          <p className="text-sm mt-2 text-red-300/80">💡 {helpText}</p>
        </div>
      </div>
    </div>
  );
};

export const EmptyState: React.FC = () => {
  return (
    <div className="text-center py-12 text-gray-400">
      <p className="text-lg">📊 No results yet</p>
      <p className="text-sm mt-2">Fill in the form and click Calculate to see results</p>
      <div className="mt-4 text-xs text-gray-500 space-y-1">
        <p>✓ All fields are required</p>
        <p>✓ Use positive numbers only</p>
      </div>
    </div>
  );
};
