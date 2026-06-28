import { Deck } from "@/components/Deck";
import { slides } from "@/components/slides";

export default function Home() {
  return <Deck slides={slides} />;
}
