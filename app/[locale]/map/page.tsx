"use client"


import { useTranslations } from "next-intl";

export default function MessagesPage() {
  const t = useTranslations("Map");

  return <h1>{t("title")}</h1>;
}