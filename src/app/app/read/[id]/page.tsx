import { ReadClient } from "./read-client";

export default async function ReadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ReadClient id={id} />;
}
