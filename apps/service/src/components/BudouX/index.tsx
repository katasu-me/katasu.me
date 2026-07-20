import { jaModel, Parser } from "budoux";
import { css } from "styled-system/css";

type Props = {
  children: string;
};

export default function BudouX({ children }: Props) {
  const parser = new Parser(jaModel);
  let offset = 0;

  const result = parser.parse(children).map((word) => {
    offset += word.length;

    return (
      <span className={css({ display: "inline-block" })} key={`${offset}-${word}`}>
        {word}
      </span>
    );
  });

  return <>{result}</>;
}
