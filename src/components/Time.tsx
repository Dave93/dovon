import dayjs from "dayjs";
import { useEffect, useState } from "react";
export const Time = () => {
  const [time, setTime] = useState<{
    day: string;
    time: string;
  }>({
    day: "",
    time: "",
  });

  const refreshTime = () => {
    const time = dayjs().format("HH:mm:ss");
    setTime({
      day: dayjs().format("DD.MM.YYYY"),
      time,
    });
  };

  useEffect(() => {
    refreshTime();
    const second = setInterval(() => {
      refreshTime();
    }, 1000);

    return () => {
      clearInterval(second);
    };
  }, []);

  return (
    <div className="flex items-center justify-center flex-col font-bold text-2xl">
      <div>{time.day}</div> <div>{time.time}</div>
    </div>
  );
};
