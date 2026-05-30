import { createContext, useContext, useState } from "react";

const PdfPreviewContext = createContext(null);

export function PdfPreviewProvider({ children }) {
  const [previewState, setPreviewState] = useState({
    isOpen: false,
    file: null,
    url: "",
    token: "",
    source: "local", // "local" or "uploaded"
  });

  function openPreview({
    file = null,
    url = "",
    token = "",
    source = "local",
  }) {
    setPreviewState({
      isOpen: true,
      file,
      url,
      token,
      source,
    });
  }

  function closePreview() {
    setPreviewState({
      isOpen: false,
      file: null,
      url: "",
      token: "",
      source: "local",
    });
  }

  const value = {
    ...previewState,
    openPreview,
    closePreview,
  };

  return (
    <PdfPreviewContext.Provider value={value}>
      {children}
    </PdfPreviewContext.Provider>
  );
}

export function usePdfPreview() {
  const context = useContext(PdfPreviewContext);
  if (!context) {
    throw new Error("usePdfPreview must be used within PdfPreviewProvider");
  }
  return context;
}
