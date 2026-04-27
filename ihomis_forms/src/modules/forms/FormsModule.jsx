import { useState } from "react";
import Forms from "./Forms.jsx";

function FormsModule({ selectedPatient = null }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return (
    <Forms
      isDarkMode={isDarkMode}
      setIsDarkMode={setIsDarkMode}
      selectedPatient={selectedPatient}
    />
  );
}

export default FormsModule;
