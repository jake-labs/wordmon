import { notFound } from "next/navigation";
import MonsterScreen from "@/components/MonsterScreen";
import { getSpecies, SPECIES } from "@/data/monsters";

export const dynamicParams = false;

export function generateStaticParams() {
  return SPECIES.map((s) => ({ id: s.id }));
}

export default async function MonsterPage(props: PageProps<"/monster/[id]">) {
  const { id } = await props.params;
  const species = getSpecies(id);
  if (!species) notFound();
  return <MonsterScreen id={species.id} />;
}
