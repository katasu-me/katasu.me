import { Link } from "@tanstack/react-router";
import type { PropsWithChildren } from "react";
import { css } from "styled-system/css";
import LogoImage from "@/assets/logo.svg?react";
import Button from "@/components/Button";

type Props = PropsWithChildren<{
  title: string;
  showBackButton?: boolean;
}>;

export default function MessagePage({ title, children, showBackButton = false }: Props) {
  return (
    <div
      className={css({
        gridColumnStart: "2",
        display: "flex",
        minH: "screen",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      })}
    >
      <section
        className={css({
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        })}
      >
        <LogoImage className={css({ w: { base: "32", pc: "48" }, opacity: 0.7 })} />
        <h1
          className={css({
            mt: "8",
            fontWeight: "normal",
            fontSize: { base: "2xl", pc: "3xl" },
            lineHeight: { base: "8", pc: "9" },
            color: "warm-black",
          })}
        >
          {title}
        </h1>
        <div className={css({ mt: "4", color: "warm-black" })}>{children}</div>
        {showBackButton && (
          <Link to="/" className={css({ mt: "8" })}>
            <Button>トップページに戻る</Button>
          </Link>
        )}
      </section>
    </div>
  );
}
