import { parseWithValibot } from "@conform-to/valibot";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { signUpFormSchema } from "../../schemas/signup-form";
import SignUpForm from "./index";

vi.mock("../../actions/signup", () => ({
  signupAction: vi.fn(),
}));

describe("SignUpForm", () => {
  it("初期状態では送信ボタンが無効である", () => {
    render(<SignUpForm />);

    const submitButton = screen.getByRole("button", { name: "新規登録" });
    expect(submitButton).toBeDisabled();
  });

  it("ユーザー名と利用規約・プライバシポリシーに同意すると送信ボタンが有効になる", async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    const usernameInput = screen.getByLabelText("ユーザー名");
    const termsCheckbox = screen.getByLabelText(/利用規約に同意します/);
    const privacyCheckbox = screen.getByLabelText(/プライバシーポリシーに同意します/);
    const submitButton = screen.getByRole("button", { name: "新規登録" });

    // 初期状態では送信ボタンが無効
    expect(submitButton).toBeDisabled();

    // ユーザー名を入力
    await user.type(usernameInput, "testuser");

    // まだ同意していないので送信ボタンは無効のまま
    expect(submitButton).toBeDisabled();

    // 利用規約に同意
    await user.click(termsCheckbox);

    // まだプライバシーポリシーに同意していないので送信ボタンは無効のまま
    expect(submitButton).toBeDisabled();

    // プライバシーポリシーに同意
    await user.click(privacyCheckbox);

    // すべての条件が満たされたので送信ボタンが有効になる
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it("利用規約・プライバシポリシーのどちらかを外すと送信ボタンが無効になる", async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);

    const usernameInput = screen.getByLabelText("ユーザー名");
    const termsCheckbox = screen.getByLabelText(/利用規約に同意します/);
    const privacyCheckbox = screen.getByLabelText(/プライバシーポリシーに同意します/);
    const submitButton = screen.getByRole("button", { name: "新規登録" });

    // すべての条件を満たして送信ボタンを有効にする
    await user.type(usernameInput, "testuser");
    await user.click(termsCheckbox);
    await user.click(privacyCheckbox);

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    // 利用規約のチェックを外す
    await user.click(termsCheckbox);

    // 送信ボタンが無効になる
    expect(submitButton).toBeDisabled();

    // 利用規約に再度同意
    await user.click(termsCheckbox);

    // 送信ボタンが再び有効になる
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    // 今度はプライバシーポリシーのチェックを外す
    await user.click(privacyCheckbox);

    // 送信ボタンが無効になる
    expect(submitButton).toBeDisabled();
  });

  it("signupActionに送られるformDataの内容が正しい", async () => {
    const user = userEvent.setup();
    const { signupAction } = await import("../../actions/signup");

    render(<SignUpForm />);

    const usernameInput = screen.getByLabelText("ユーザー名");
    const termsCheckbox = screen.getByLabelText(/利用規約に同意します/);
    const privacyCheckbox = screen.getByLabelText(/プライバシーポリシーに同意します/);
    const submitButton = screen.getByRole("button", { name: "新規登録" });

    // フォームに入力
    await user.type(usernameInput, "testuser123");
    await user.click(termsCheckbox);
    await user.click(privacyCheckbox);

    // 送信ボタンが有効になることを確認
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    // フォームを送信
    await user.click(submitButton);

    // signupActionが呼び出されることを確認
    expect(signupAction).toHaveBeenCalledTimes(1);

    // FormDataの内容を検証
    const formDataCall = vi.mocked(signupAction).mock.calls[0];
    const formData = formDataCall[1] as FormData;

    let submission = parseWithValibot(formData, {
      schema: signUpFormSchema,
    });

    expect(submission.status).toBe("success");

    // テストなので成功時の型にアサーション
    submission = submission as Extract<typeof submission, { status: "success" }>;

    expect(submission.value.username).toBe("testuser123");
    expect(submission.value.agreeToTerms).toBe("on");
    expect(submission.value.agreeToPrivacy).toBe("on");
    expect(submission.value.avatar).toBeUndefined();
  });
});
