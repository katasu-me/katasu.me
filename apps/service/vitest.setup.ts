import "@testing-library/jest-dom";
import { vi } from "vitest";

// scrollIntoViewのモック
Element.prototype.scrollIntoView = vi.fn();

// SVGファイルのモック
vi.mock("@/assets/icons/close.svg", () => ({
  default: () => null,
}));
