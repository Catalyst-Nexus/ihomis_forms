import { useState } from "react";
import Forms from "./Forms.jsx";

function FormsModule() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  return <Forms isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />;
}

export default FormsModule;
