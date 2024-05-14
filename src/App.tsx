import { useEffect } from "react";
import "./App.css";
import { useSizes } from "./stores/sizes";
import {
  CircularProgress,
  Button,
  Tabs,
  Tab,
  Card,
  CardBody,
} from "@nextui-org/react";
import { Plus } from "lucide-react";
import { NextUIProvider } from "@nextui-org/react";
import { AddSizeForm } from "./components/sizes/AddForm";

function App() {
  const isSizesLoading = useSizes((state) => state.isLoading);
  const sizes = useSizes((state) => state.items);
  const loadSizes = useSizes((state) => state.loadSizes);
  const onAdd = useSizes((state) => state.onAdd);

  useEffect(() => {
    loadSizes();
  }, []);
  return (
    <NextUIProvider>
      <div className="h-screen px-2">
        {isSizesLoading && (
          <div className="w-full flex items-center justify-center h-full">
            <CircularProgress label="Loading..." size="lg" />
          </div>
        )}
        {!isSizesLoading && sizes.length == 0 && (
          <div className="w-full flex flex-col space-y-4 items-center justify-center h-full">
            <p className="text-center text-2xl">
              Размеры не найдены. Добавьте их в базу данных.
            </p>
            <Button color="primary" startContent={<Plus />} onClick={onAdd}>
              Добавить
            </Button>
          </div>
        )}
        {!isSizesLoading && sizes.length > 0 && (
          <div className="w-full h-full relative pt-2">
            <Button
              isIconOnly
              color="primary"
              onClick={onAdd}
              className="absolute right-0 top-2"
            >
              <Plus />
            </Button>
            <Tabs aria-label="Dynamic tabs" items={sizes}>
              {(item) => (
                <Tab
                  key={item.id}
                  title={`${item.length} x ${item.thickness}`}
                  className="h-full"
                >
                  <Card>
                    <CardBody>
                      {item.length} x {item.thickness} {item.type}
                    </CardBody>
                  </Card>
                </Tab>
              )}
            </Tabs>
          </div>
        )}
        <AddSizeForm />
      </div>
    </NextUIProvider>
  );
}

export default App;
