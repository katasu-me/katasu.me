import { Parser, jaModel } from "budoux";

import styles from "./index.module.css";

type Props = {
  children: string;
};

/**
 * BudouX を使っていい感じの位置で改行するためのコンポーネント
 */
export default function BudouX({ children }: Props) {
  const parser = new Parser(jaModel);

  const result = parser.parse(children).map((word, i) => (
    <span className={styles.chunk} key={`${i}-${word}`}>
      {word}
    </span>
  ));

  return <>{result}</>;
}
