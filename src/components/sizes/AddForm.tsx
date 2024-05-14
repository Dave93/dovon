import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Select,
  SelectItem,
} from "@nextui-org/react";
import { Size, useSizes } from "../../stores/sizes";
import { useForm } from "@tanstack/react-form";
import { useSizeTypes } from "../../stores/size_types";

import { useEffect } from "react";

export function AddSizeForm() {
  const isAddFormOpen = useSizes((state) => state.isAddFormOpen);
  const onCancelAdd = useSizes((state) => state.onCancelAdd);
  const onAdd = useSizes((state) => state.onAdd);
  const sizeTypes = useSizeTypes((state) => state.items);
  const loadSizeTypes = useSizeTypes((state) => state.loadSizeTypes);
  const isInsertingSize = useSizes((state) => state.isInsertingSize);
  const insertSize = useSizes((state) => state.insertSize);

  useEffect(() => {
    loadSizeTypes();
  }, []);

  const form = useForm<Size>({
    defaultValues: {
      length: 0,
      thickness: 0,
      type: "",
    },
    onSubmit: async ({ value, formApi }) => {
      // Do something with form data
      console.log(value);
      const values = {
        ...value,
      };
      formApi.reset();
      insertSize(values);
    },
    validators: {
      // Add validators to the form the same way you would add them to a field
      onChange({ value }) {
        if (value.length < 0) {
          return "Длина должна быть больше 0";
        }
        if (value.thickness < 0) {
          return "Толщина должна быть больше 0";
        }

        if (value.type === "") {
          return "Тип не может быть пустым";
        }
      },
    },
  });
  return (
    <Modal backdrop="blur" isOpen={isAddFormOpen} onClose={onCancelAdd}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
      >
        <ModalContent>
          <>
            <ModalHeader className="flex flex-col gap-1">
              Добавить размер
            </ModalHeader>
            <ModalBody className="flex flex-col gap-1 space-y-2">
              <form.Field name="length">
                {(field) => (
                  <Input
                    name={field.name}
                    label="Длина"
                    placeholder="Длина"
                    type="number"
                    value={
                      typeof field.state.value === "number"
                        ? field.state.value.toString()
                        : "0"
                    }
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(+e.target.value)}
                    variant="bordered"
                    isInvalid={field.state.meta.errors?.length > 0}
                    color={
                      field.state.meta.errors?.length > 0 ? "danger" : "primary"
                    }
                    errorMessage={field.state.meta.errors?.[0]}
                  />
                )}
              </form.Field>
              <form.Field name="thickness">
                {(field) => (
                  <Input
                    name={field.name}
                    label="Толщина"
                    placeholder="Толщина"
                    type="number"
                    value={
                      typeof field.state.value === "number"
                        ? field.state.value.toString()
                        : "0"
                    }
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(+e.target.value)}
                    variant="bordered"
                    isInvalid={field.state.meta.errors?.length > 0}
                    color={
                      field.state.meta.errors?.length > 0 ? "danger" : "primary"
                    }
                    errorMessage={field.state.meta.errors?.[0]}
                  />
                )}
              </form.Field>
              <form.Field name="type">
                {(field) => (
                  <Select
                    name={field.name}
                    label="Тип"
                    placeholder="Тип"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    variant="bordered"
                    isInvalid={field.state.meta.errors?.length > 0}
                    color={
                      field.state.meta.errors?.length > 0 ? "danger" : "primary"
                    }
                    errorMessage={field.state.meta.errors?.[0]}
                  >
                    {sizeTypes.map((type) => (
                      <SelectItem key={type.code} value={type.code}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              </form.Field>
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                type="submit"
                disabled={isInsertingSize}
                isLoading={isInsertingSize}
              >
                Добавить
              </Button>
              <Button onClick={onCancelAdd}>Отмена</Button>
            </ModalFooter>
          </>
        </ModalContent>
      </form>
    </Modal>
  );
}
