import { useEffect } from "react";
import "./App.css";
import { useSizes } from "./stores/sizes";
import { CircularProgress } from "@nextui-org/react";
import { Accordion, AccordionItem } from "@nextui-org/react";
import { NextUIProvider } from "@nextui-org/react";

function App() {
  const isSizesLoading = useSizes((state) => state.isLoading);
  const sizes = useSizes((state) => state.items);
  const loadSizes = useSizes((state) => state.loadSizes);

  useEffect(() => {
    loadSizes();
  }, []);
  const defaultContent =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

  return (
    <NextUIProvider>
      <div className="container">
        {isSizesLoading && <CircularProgress label="Loading..." />}
        <Accordion>
          <AccordionItem key="1" aria-label="Accordion 1" title="Accordion 1">
            {defaultContent}
          </AccordionItem>
          <AccordionItem key="2" aria-label="Accordion 2" title="Accordion 2">
            {defaultContent}
          </AccordionItem>
          <AccordionItem key="3" aria-label="Accordion 3" title="Accordion 3">
            {defaultContent}
          </AccordionItem>
        </Accordion>
      </div>
    </NextUIProvider>
  );
}

export default App;
