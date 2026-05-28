"use client";

import { useLanguage } from "./LanguageProvider";
import PDFBookReaderClient from "./PDFBookReaderClient";

interface Props {
  pdfUrl: string | null;
  pdfUrlMn: string | null;
  title: string;
  titleMn: string | null;
}

export default function PDFArticleClient({ pdfUrl, pdfUrlMn, title, titleMn }: Props) {
  const { locale } = useLanguage();

  const url         = (locale === "mn" && pdfUrlMn) ? pdfUrlMn : (pdfUrl ?? pdfUrlMn ?? "");
  const displayTitle = (locale === "mn" && titleMn)  ? titleMn  : title;

  if (!url) return null;

  return <PDFBookReaderClient pdfUrl={url} title={displayTitle} />;
}
