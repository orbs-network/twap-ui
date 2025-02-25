import React from "react";
import { Message } from "../../components/base";
import { useChunkSizeMessage } from "../hooks";

export const WidgetMessage = () => {
  const message = useChunkSizeMessage();
  if (!message) return null;

  return <Message title={message} />;
};
