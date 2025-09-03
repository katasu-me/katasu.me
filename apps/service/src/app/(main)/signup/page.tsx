import SignUpForm from "@/features/account/components/SignUpForm";

export default function SignUpPage() {
  return (
    <div className="col-span-full grid grid-cols-subgrid gap-y-12 py-16">
      <header className="col-start-2 flex flex-col items-center justify-center">
        <h1 className="text-4xl">新規登録</h1>
        <p className="mt-2 ml-4 text-warm-black-50">アイコンとユーザー名をきめましょう</p>
      </header>

      <main className="col-start-2">
        <div className="mx-auto max-w-md rounded-lg bg-warm-black-10 p-8">
          <SignUpForm />
        </div>
      </main>
    </div>
  );
}
