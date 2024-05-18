import { Button } from "@nextui-org/react";
import { useOrders } from "../../stores/orders";
import { Size } from "../../stores/sizes";
import { FC } from "react";
import { Plus } from "lucide-react";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { OrderSummary } from "./OrderSummary";

interface OrderCardProps {
  size: Size;
}
export const OrderCard: FC<OrderCardProps> = ({ size }) => {
  const getOrder = useOrders((state) => state.getOrder);
  const onAdd = useOrders((state) => state.onAdd);
  const orders = useOrders((state) => state.orders);
  const order = getOrder(size.id!);
  console.log("order", order);
  return (
    <div className="w-full h-full relative pt-2">
      {!order && (
        <div className="w-full flex flex-col space-y-4 items-center justify-center h-full">
          <p className="text-center text-2xl">
            Заказ по размеру {size.length} x {size.thickness} {size.type} не
            найден. Добавьте его.
          </p>
          <Button
            color="primary"
            startContent={<Plus />}
            onClick={() => {
              onAdd(size.id!);
            }}
          >
            Добавить
          </Button>
        </div>
      )}
      {order && (
        <div className="w-full h-full relative flex flex-col">
          <div className="grow">
            <ResizablePanelGroup
              direction="horizontal"
              className="min-h-[200px]"
            >
              <ResizablePanel defaultSize={60}>
                <div className="flex h-full items-center justify-center p-6">
                  <span className="font-semibold">Sidebar</span>
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={40}>
                <div className="flex h-full items-center justify-center p-6">
                  <span className="font-semibold">Content</span>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
          <div className="h-[20vh] w-full flex flex-col items-center justify-center border-t-2">
            <OrderSummary order={order} />
          </div>
        </div>
      )}
    </div>
  );
};
