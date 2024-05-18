import { useForm } from "@tanstack/react-form";
import { Order, useOrders } from "../../stores/orders";
import { useEffect } from "react";
import dayjs from "dayjs";
import { useSizes } from "../../stores/sizes";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@nextui-org/react";

export const AddOrderForm = () => {
  const isAddFormOpen = useOrders((state) => state.isAddFormOpen);
  const onCancelAdd = useOrders((state) => state.onCancelAdd);
  const addingSizeId = useOrders((state) => state.addingSizeId);
  const isInsertingOrder = useOrders((state) => state.isInsertingOrder);
  const insertOrder = useOrders((state) => state.insertOrder);
  const getSize = useSizes((state) => state.getSize);

  const form = useForm<Order>({
    defaultValues: {
      order_number: "",
      pipe_weight: 0,
      order_weight: 0,
      size_id: addingSizeId ?? 0,
      status: "new",
    },
    onSubmit: async ({ value, formApi }) => {
      // Do something with form data
      console.log(value);
      const values = {
        ...value,
      };
      formApi.reset();
      insertOrder(values);
    },
    validators: {
      // Add validators to the form the same way you would add them to a field
      onChange({ value }) {
        if (value.pipe_weight < 0) {
          return "Необходимо указать вес вращающегося потока";
        }
        if (value.order_weight < 0) {
          return "Необходимо указать вес заказа";
        }
      },
    },
  });

  const loadSize = async () => {
    const size = getSize(addingSizeId!);
    if (size) {
      form.setFieldValue(
        "order_number",
        `${dayjs().format("YY")}-${dayjs().format("DDMM")}${(
          size.length / 10
        ).toFixed(0)}${size.thickness * 1000}`
      );
    }
  };

  useEffect(() => {
    if (addingSizeId) {
      loadSize();
    }
  }, [addingSizeId]);

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
              Добавить заказ
            </ModalHeader>
            <ModalBody className="flex flex-col gap-1 space-y-2">
              <form.Field name="pipe_weight">
                {(field) => (
                  <Input
                    name={field.name}
                    label="Размер трубки"
                    placeholder="Размер трубки"
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
                    endContent="кг"
                  />
                )}
              </form.Field>
              <form.Field name="order_weight">
                {(field) => (
                  <Input
                    name={field.name}
                    label="Вес заказа"
                    placeholder="Вес заказа"
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
                    endContent="кг"
                  />
                )}
              </form.Field>
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                type="submit"
                disabled={isInsertingOrder}
                isLoading={isInsertingOrder}
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
};
