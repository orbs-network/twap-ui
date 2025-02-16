import React from "react";
import { Message } from "../../components/base";
import { useShouldWrapOrUnwrapOnly } from "../../hooks/useShouldWrapOrUnwrap";
import { useError } from "../hooks";

export function ErrorMessage() {
  const hide = useShouldWrapOrUnwrapOnly();

  const error = useError();

  if (!error || hide) return null;

  return <Message variant="error" title={error} />;
}
