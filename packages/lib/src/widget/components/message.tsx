import React from "react";
import { Message } from "../../components/base";
import { useMessage } from "../hooks";

export const WidgetMessage = () => {
  const message = useMessage();
  if (!message) return null;

  return <Message title={message} />;
};
