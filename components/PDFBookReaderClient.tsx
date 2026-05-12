"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import type PDFBookReader from "./PDFBookReader";

const PDFBookReaderDynamic = dynamic(() => import("./PDFBookReader"), { ssr: false });

export default function PDFBookReaderClient(props: ComponentProps<typeof PDFBookReader>) {
  return <PDFBookReaderDynamic {...props} />;
}
