import { Order } from "@/stores/orders";
import { Button } from "@nextui-org/react";
import { Time } from "../Time";

export const OrderSummary = ({ order }: { order: Order }) => {
  return (
    <div className="w-full h-full">
      <div className="flex items-center mx-auto space-x-4 pt-2 w-fit">
        <div className="text-center">
          <div>Номер заказа</div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1">
              <div className="text-2xl font-bold">{order.order_number}</div>
            </div>
          </div>
        </div>
        <div className="text-center">
          <div>Размеры заказа</div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1">
              <div className="text-2xl font-bold">
                {order.length} x {order.thickness} мм
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-gray-200">
        <div>
          <dl className="divide-y divide-gray-100">
            <div className="px-4 py-2 text-sm sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
              <dt className="font-bold leading-6 text-gray-900">Вес трубки</dt>
              <dd className="mt-1 leading-6 text-gray-700 sm:mt-0">
                {order.pipe_weight} кг
              </dd>
            </div>
          </dl>
          <dl className="divide-y divide-gray-100">
            <div className="px-4 py-2 text-sm sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
              <dt className="font-bold leading-6 text-gray-900">Вес заказа</dt>
              <dd className="mt-1 leading-6 text-gray-700 sm:mt-0">
                {order.order_weight} кг
              </dd>
            </div>
          </dl>
          <dl className="divide-y divide-gray-100">
            <div className="px-4 py-2 text-sm sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
              <dt className="font-bold leading-6 text-gray-900">
                Количество рулонов
              </dt>
              <dd className="mt-1 leading-6 text-gray-700 sm:mt-0">
                {order.order_weight} кг
              </dd>
            </div>
          </dl>
        </div>
        <div className="pl-2">
          <dl className="divide-y divide-gray-100">
            <div className="px-4 py-2 text-2xl sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
              <dt className="font-bold leading-6 text-gray-900">Готово</dt>
              <dd className="mt-1 leading-6 text-gray-700 sm:mt-0">
                {order.pipe_weight} кг
              </dd>
            </div>
          </dl>
          <dl className="divide-y divide-gray-100">
            <div className="px-4 py-2 text-2xl sm:grid sm:grid-cols-2 sm:gap-4 sm:px-0">
              <dt className="font-bold leading-6 text-gray-900">
                Осталось ещё
              </dt>
              <dd className="mt-1 leading-6 text-gray-700 sm:mt-0">
                {order.order_weight} кг
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex items-center justify-center pl-2 flex-col space-y-2">
          <Button color="primary" size="lg">
            Новый заказ
          </Button>
          <Time />
        </div>
      </div>
    </div>
  );
};
