import RouletteGame from "@/components/RouletteGame";
import Image from "next/image";

export default function Home() {
  return (
    <div className="">
      <RouletteGame page={{ game: { table_type: 'european' } }} />
    </div>
  );
}
