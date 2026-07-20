import { Link } from "@tanstack/react-router";
import { css, cx } from "styled-system/css";
import type { SystemStyleObject } from "styled-system/types";
import LogoImage from "@/assets/logo.svg?react";
import ExternalLink from "@/components/ExternalLink";
import { DOCS_INFORMATION, DOCS_LICENSE, DOCS_PRIVACY_POLICY, DOCS_TERMS_OF_SERVICE } from "@/constants/site";
import DevelopedBy from "./DevelopedBy";

type Props = {
  className?: string;
  cssProps?: SystemStyleObject;
};

export default function Footer({ className, cssProps }: Props) {
  return (
    <footer
      className={cx(
        css(
          {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderTopWidth: "1px",
            borderColor: "warm-black-25",
            py: "32",
          },
          cssProps,
        ),
        className,
      )}
    >
      <DevelopedBy />

      <div className={css({ my: "16", display: "flex", gap: "1" })}>
        {new Array(3).fill(null).map((_, index) => (
          <span key={index.toString()} className={css({ h: "1", w: "2", rounded: "full", bg: "warm-black-25" })} />
        ))}
      </div>

      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "10",
        })}
      >
        <Link className="interactive-scale-brightness" to="/">
          <LogoImage className={css({ h: "16", w: "16" })} />
        </Link>

        <nav
          className={css({
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "2",
            fontSize: "sm",
            lineHeight: "5",
            color: "warm-black",
          })}
        >
          <ExternalLink href={DOCS_INFORMATION}>お知らせなど</ExternalLink>
          <ExternalLink href={DOCS_TERMS_OF_SERVICE} target="_blank" rel="noopener">
            利用規約
          </ExternalLink>
          <ExternalLink href={DOCS_PRIVACY_POLICY} target="_blank" rel="noopener">
            プライバシーポリシー
          </ExternalLink>
          <ExternalLink href={DOCS_LICENSE} target="_blank" rel="noopener">
            ライセンス
          </ExternalLink>
        </nav>
      </div>

      <p className={css({ mt: "10", fontSize: "xs", lineHeight: "4" })}>© katasu.me</p>
    </footer>
  );
}
