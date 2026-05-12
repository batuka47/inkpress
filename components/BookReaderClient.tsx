"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type BookReader from "./BookReader";

const BookReaderDynamic = dynamic(() => import("./BookReader"), { ssr: false });

export default function BookReaderClient(props: ComponentProps<typeof BookReader>) {
  return <BookReaderDynamic {...props} />;
}
