import { jaModel, Parser } from "budoux";

type Props = {
  children: string;
};

/**
 * BudouX を使っていい感じの位置で改行するためのコンポーネント
 */
export default function BudouX({ children }: Props) {
  const parser = new Parser(jaModel);

  const result = parser.parse(children).map((word, i) => (
    <span className="inline-block" key={`${i}-${word}`}>
      {word}
    </span>
  ));

  return <>{result}</>;
}
