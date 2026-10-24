import { notFound } from "next/navigation";
import StudyScreen from "@/components/StudyScreen";
import { getSpecies, SPECIES } from "@/data/monsters";

export const dynamicParams = false;

export function generateStaticParams() {
  return SPECIES.map((s) => ({ id: s.id }));
}

export default async function StudyPage(props: PageProps<"/monster/[id]/study">) {
  const { id } = await props.params;
  const species = getSpecies(id);
  if (!species) notFound();
  return <StudyScreen id={species.id} />;
}
